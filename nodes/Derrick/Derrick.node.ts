import { INodeType, INodeTypeDescription } from 'n8n-workflow';

// Four operations read LinkedIn through the account's own session, kept alive by
// the Derrick Chrome extension. Verified against the API: when the session is
// missing or stale the call is accepted and returns an explicit CREDENTIALS
// error, so the failure is legible rather than silent.
const LINKEDIN_SESSION_NOTE =
	' Needs a live LinkedIn session in Derrick, kept connected by the Derrick Chrome extension. Without it the API answers "LinkedIn session expired" instead of returning data.';

export class Derrick implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Derrick',
		name: 'derrick',
		icon: 'file:derrick.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Enrich B2B contact and company data with Derrick',
		defaults: {
			name: 'Derrick',
		},
		usableAsTool: true,
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'derrickApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://app1.derrick-app.com/api/v1',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				'X-Derrick-Client': 'n8n',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Company', value: 'company' },
					{ name: 'Person', value: 'person' },
				],
				default: 'person',
			},

			// ---------------------------------------------------------------- Person
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['person'] } },
				options: [
					{
						name: 'Enrich LinkedIn Profile',
						value: 'enrichProfile',
						action: 'Enrich a profile',
						description:
							'Enrich a LinkedIn profile with full data. Charged per call, 1 credit.' +
							LINKEDIN_SESSION_NOTE,
						routing: { request: { method: 'POST', url: '/enrich_profile' } },
					},
					{
						name: 'Find LinkedIn Profile',
						value: 'findLinkedinProfile',
						action: 'Find a profile',
						description:
							'Find a LinkedIn profile URL from a name, optionally narrowed by company. Charged per call, 1 credit.',
						routing: { request: { method: 'POST', url: '/search_linkedin_profile' } },
					},
					{
						name: 'Find Mobile Phone',
						value: 'findPhone',
						action: 'Find a mobile phone',
						description:
							'Find a mobile phone number from a LinkedIn profile URL. Charged per result found, 150 credits. Filter your list before running this one.',
						routing: { request: { method: 'POST', url: '/find_phone' } },
					},
					{
						name: 'Find Work Email',
						value: 'findEmail',
						action: 'Find a work email',
						description:
							'Find a verified work email from a full name and a company. Charged per result found, 5 credits, so a lookup that finds nothing costs nothing.',
						routing: { request: { method: 'POST', url: '/find_email' } },
					},
					{
						name: 'Get Follower Count',
						value: 'followerCount',
						action: 'Get a follower count',
						description:
							'Get followers and connections of a LinkedIn profile. Charged per call, 1 credit.' +
							LINKEDIN_SESSION_NOTE,
						routing: {
							request: { method: 'POST', url: '/linkedin_profile_followers_count' },
						},
					},
				],
				default: 'findEmail',
			},

			// --------------------------------------------------------------- Company
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['company'] } },
				options: [
					{
						name: 'Enrich LinkedIn Company',
						value: 'enrichCompany',
						action: 'Enrich a company',
						description:
							'Enrich a company with its LinkedIn data. Charged per call, 1 credit.' +
							LINKEDIN_SESSION_NOTE,
						routing: { request: { method: 'POST', url: '/enrich_companies' } },
					},
					{
						name: 'Find LinkedIn Company',
						value: 'findCompany',
						action: 'Find a company',
						description:
							'Find a LinkedIn company page from a company name. Charged per call, 1 credit.' +
							LINKEDIN_SESSION_NOTE,
						routing: { request: { method: 'POST', url: '/search_companies' } },
					},
					{
						name: 'Find Similar Companies',
						value: 'findSimilar',
						action: 'Find similar companies',
						description:
							'Find companies similar to a reference LinkedIn company. Charged per call, 1 credit.',
						routing: { request: { method: 'POST', url: '/find_similar_companies' } },
					},
					{
						name: 'Find Tech Stack',
						value: 'findTech',
						action: 'Find a tech stack',
						description:
							'Identify the technologies used on a website. Charged per call, 2 credits.',
						routing: { request: { method: 'POST', url: '/find_tech' } },
					},
				],
				default: 'findCompany',
			},

			// ------------------------------------------------------ Fields: findEmail
			{
				displayName: 'Full Name',
				name: 'fullName',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'Jane Doe',
				description: 'Full name of the person to find an email for',
				displayOptions: { show: { resource: ['person'], operation: ['findEmail'] } },
				routing: { send: { type: 'body', property: 'data.fullName' } },
			},
			{
				displayName: 'Company',
				name: 'company',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'acme.com',
				description: 'Company name or domain the person works for',
				displayOptions: { show: { resource: ['person'], operation: ['findEmail'] } },
				routing: { send: { type: 'body', property: 'data.company' } },
			},
			{
				displayName: 'LinkedIn Company URL',
				name: 'linkedinCompanyURL',
				type: 'string',
				default: '',
				placeholder: 'https://www.linkedin.com/company/acme',
				description:
					'Optional LinkedIn company page, to tell apart companies that share a name',
				displayOptions: { show: { resource: ['person'], operation: ['findEmail'] } },
				routing: { send: { type: 'body', property: 'data.linkedinCompanyURL' } },
			},

			// ------------------------------------------------------ Fields: findPhone
			{
				displayName: 'LinkedIn Profile URL',
				name: 'linkedinProfilUrl',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'https://www.linkedin.com/in/janedoe',
				description: 'LinkedIn profile to find a mobile phone for',
				displayOptions: { show: { resource: ['person'], operation: ['findPhone'] } },
				routing: { send: { type: 'body', property: 'data.linkedinProfilUrl' } },
			},

			// ------------------------------- Fields: queryValue-based person lookups
			{
				displayName: 'Query',
				name: 'queryValuePerson',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'Jane Doe',
				description:
					'Person name for Find LinkedIn Profile, or a LinkedIn profile URL for the enrich and follower operations',
				displayOptions: {
					show: {
						resource: ['person'],
						operation: ['findLinkedinProfile', 'enrichProfile', 'followerCount'],
					},
				},
				routing: { send: { type: 'body', property: 'data.queryValue' } },
			},
			{
				displayName: 'Company',
				name: 'companyValue',
				type: 'string',
				default: '',
				placeholder: 'Acme',
				description: 'Optional company name, to narrow the search to people working there',
				displayOptions: { show: { resource: ['person'], operation: ['findLinkedinProfile'] } },
				routing: { send: { type: 'body', property: 'data.companyValue' } },
			},

			// ------------------------------ Fields: queryValue-based company lookups
			{
				displayName: 'Query',
				name: 'queryValueCompany',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'Acme',
				description: 'Company name, domain, or LinkedIn company URL',
				displayOptions: {
					show: { resource: ['company'], operation: ['findCompany', 'enrichCompany'] },
				},
				routing: { send: { type: 'body', property: 'data.queryValue' } },
			},

			// --------------------------------------------------- Fields: findSimilar
			{
				displayName: 'LinkedIn Company ID',
				name: 'linkedinId',
				type: 'string',
				required: true,
				default: '',
				placeholder: '68497',
				description:
					'Numeric LinkedIn ID of the reference company, as in linkedin.com/company/68497. A company slug such as "acme" is rejected by the API.',
				displayOptions: { show: { resource: ['company'], operation: ['findSimilar'] } },
				routing: { send: { type: 'body', property: 'data.linkedinId' } },
			},
			{
				displayName: 'Options',
				name: 'similarOptions',
				type: 'collection',
				placeholder: 'Add option',
				default: {},
				displayOptions: { show: { resource: ['company'], operation: ['findSimilar'] } },
				options: [
					{
						displayName: 'Country',
						name: 'country',
						type: 'string',
						default: '',
						description: 'Restrict results to a country',
						routing: { send: { type: 'body', property: 'data.country' } },
					},
					{
						displayName: 'Max Results',
						name: 'maxNumberOfResults',
						type: 'options',
						options: [
							{ name: '10', value: '10' },
							{ name: '20', value: '20' },
							{ name: '50', value: '50' },
							{ name: '100', value: '100' },
							{ name: '200', value: '200' },
						],
						default: '20',
						description: 'Maximum number of companies to return',
						routing: { send: { type: 'body', property: 'data.maxNumberOfResults' } },
					},
					{
						displayName: 'Page',
						name: 'page',
						type: 'number',
						default: 0,
						description:
							'Result page to fetch, counted from 0. Each page returns up to 20 companies.',
						routing: { send: { type: 'body', property: 'data.page' } },
					},
				],
			},

			// ------------------------------------------------------ Fields: findTech
			{
				displayName: 'Website URL',
				name: 'website_url',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'https://acme.com',
				description: 'Website to detect technologies on',
				displayOptions: { show: { resource: ['company'], operation: ['findTech'] } },
				routing: { send: { type: 'body', property: 'data.website_url' } },
			},
		],
	};
}
