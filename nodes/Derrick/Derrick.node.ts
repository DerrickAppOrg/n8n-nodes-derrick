import { INodeType, INodeTypeDescription } from 'n8n-workflow';

const CHROME_EXTENSION_NOTE =
	' Requires the Derrick Chrome extension installed and connected, because this call reads LinkedIn through your own session. It returns empty results without it.';

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
					{ name: 'Person', value: 'person' },
					{ name: 'Company', value: 'company' },
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
						name: 'Find Work Email',
						value: 'findEmail',
						action: 'Find a work email',
						description: 'Find a verified work email from a full name and a company. Billed per result found, so a lookup that returns nothing costs nothing. 5 credits.',
						routing: { request: { method: 'POST', url: '/find_email' } },
					},
					{
						name: 'Find Mobile Phone',
						value: 'findPhone',
						action: 'Find a mobile phone',
						description: 'Find a mobile phone number from a LinkedIn profile URL. Billed per result found. 150 credits.',
						routing: { request: { method: 'POST', url: '/find_phone' } },
					},
					{
						name: 'Find LinkedIn Profile',
						value: 'findLinkedinProfile',
						action: 'Find a linkedin profile',
						description: 'Find a LinkedIn profile URL from a name, optionally narrowed by company. Billed per call. 1 credit.',
						routing: { request: { method: 'POST', url: '/search_linkedin_profile' } },
					},
					{
						name: 'Enrich LinkedIn Profile',
						value: 'enrichProfile',
						action: 'Enrich a linkedin profile',
						description: 'Enrich a LinkedIn profile with full data. Billed per call. 1 credit.' + CHROME_EXTENSION_NOTE,
						routing: { request: { method: 'POST', url: '/enrich_profile' } },
					},
					{
						name: 'Get Follower Count',
						value: 'followerCount',
						action: 'Get follower count',
						description: 'Get followers and connections for a LinkedIn profile. Billed per call. 1 credit.' + CHROME_EXTENSION_NOTE,
						routing: { request: { method: 'POST', url: '/linkedin_profile_followers_count' } },
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
						name: 'Find LinkedIn Company',
						value: 'findCompany',
						action: 'Find a linkedin company',
						description: 'Find a LinkedIn company page from a company name. Billed per call. 1 credit.' + CHROME_EXTENSION_NOTE,
						routing: { request: { method: 'POST', url: '/search_companies' } },
					},
					{
						name: 'Enrich LinkedIn Company',
						value: 'enrichCompany',
						action: 'Enrich a linkedin company',
						description: 'Enrich a company with its LinkedIn data. Billed per call. 1 credit.' + CHROME_EXTENSION_NOTE,
						routing: { request: { method: 'POST', url: '/enrich_companies' } },
					},
					{
						name: 'Find Similar Companies',
						value: 'findSimilar',
						action: 'Find similar companies',
						description: 'Find companies similar to a given LinkedIn company. Billed per call. 1 credit.',
						routing: { request: { method: 'POST', url: '/find_similar_companies' } },
					},
					{
						name: 'Find Tech Stack',
						value: 'findTech',
						action: 'Find a tech stack',
						description: 'Identify the technologies used on a website. Billed per call. 2 credits.',
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
				routing: { request: { body: { fullName: '={{$value}}' } } },
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
				routing: { request: { body: { company: '={{$value}}' } } },
			},
			{
				displayName: 'LinkedIn Company URL',
				name: 'linkedinCompanyURL',
				type: 'string',
				default: '',
				placeholder: 'https://www.linkedin.com/company/acme',
				description: 'Optional. LinkedIn company page, to disambiguate companies sharing a name.',
				displayOptions: { show: { resource: ['person'], operation: ['findEmail'] } },
				routing: { request: { body: { linkedinCompanyURL: '={{$value}}' } } },
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
				routing: { request: { body: { linkedinProfilUrl: '={{$value}}' } } },
			},

			// ------------------------------- Fields: queryValue-based person lookups
			{
				displayName: 'Query',
				name: 'queryValue',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'Jane Doe',
				description: 'Person name, or a LinkedIn profile URL',
				displayOptions: {
					show: {
						resource: ['person'],
						operation: ['findLinkedinProfile', 'enrichProfile', 'followerCount'],
					},
				},
				routing: { request: { body: { queryValue: '={{$value}}' } } },
			},
			{
				displayName: 'Company',
				name: 'companyValue',
				type: 'string',
				default: '',
				placeholder: 'Acme',
				description: 'Optional. Narrows the search to people at this company.',
				displayOptions: { show: { resource: ['person'], operation: ['findLinkedinProfile'] } },
				routing: { request: { body: { companyValue: '={{$value}}' } } },
			},

			// ------------------------------ Fields: queryValue-based company lookups
			{
				displayName: 'Query',
				name: 'queryValue',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'Acme',
				description: 'Company name, domain, or LinkedIn company URL',
				displayOptions: {
					show: { resource: ['company'], operation: ['findCompany', 'enrichCompany'] },
				},
				routing: { request: { body: { queryValue: '={{$value}}' } } },
			},

			// --------------------------------------------------- Fields: findSimilar
			{
				displayName: 'LinkedIn ID',
				name: 'linkedinId',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'acme',
				description: 'LinkedIn identifier of the company to find lookalikes for',
				displayOptions: { show: { resource: ['company'], operation: ['findSimilar'] } },
				routing: { request: { body: { linkedinId: '={{$value}}' } } },
			},
			{
				displayName: 'Additional Options',
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
						routing: { request: { body: { country: '={{$value}}' } } },
					},
					{
						displayName: 'Max Results',
						name: 'maxNumberOfResults',
						type: 'number',
						default: 10,
						description: 'Maximum number of companies to return',
						routing: { request: { body: { maxNumberOfResults: '={{$value}}' } } },
					},
					{
						displayName: 'Page',
						name: 'page',
						type: 'number',
						default: 1,
						description: 'Result page to fetch',
						routing: { request: { body: { page: '={{$value}}' } } },
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
				routing: { request: { body: { website_url: '={{$value}}' } } },
			},
		],
	};
}
