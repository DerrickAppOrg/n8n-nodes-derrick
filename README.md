# n8n-nodes-derrick

An [n8n](https://n8n.io) community node for [Derrick](https://derrick-app.com), a B2B data enrichment service.

Turn a name, a domain or a LinkedIn URL into usable data inside a workflow: verified work emails, mobile phone numbers, LinkedIn profiles and companies, technology stacks, and lookalike companies.

## Installation

In n8n, go to **Settings > Community Nodes**, select **Install**, and enter:

```
n8n-nodes-derrick
```

For a self-hosted instance you can also install it manually:

```bash
npm install n8n-nodes-derrick
```

## Credentials

You need a Derrick API key. Open Google Sheets, then the **Derrick** menu, then the burger icon, then **API**.

API access requires a Derrick account on the Standard plan or above.

In n8n, create a **Derrick API** credential and paste the key. The credential test calls the account endpoint, so a wrong key is caught immediately.

## Operations

### Person

| Operation | What it does | Credits |
|---|---|---|
| Find Work Email | Verified work email from a full name and a company | 5, per result found |
| Find Mobile Phone | Mobile phone from a LinkedIn profile URL | 150, per result found |
| Find LinkedIn Profile | LinkedIn profile URL from a name, optionally narrowed by company | 1, per call |
| Enrich LinkedIn Profile | Full profile data from a LinkedIn URL | 1, per call |
| Get Follower Count | Followers and connections of a LinkedIn profile | 1, per call |

### Company

| Operation | What it does | Credits |
|---|---|---|
| Find LinkedIn Company | LinkedIn company page from a company name | 1, per call |
| Enrich LinkedIn Company | Company data from a name, domain or LinkedIn URL | 1, per call |
| Find Similar Companies | Lookalikes of a given LinkedIn company | 1, per call |
| Find Tech Stack | Technologies used on a website | 2, per call |

**Per result found** means a lookup that returns nothing costs nothing. **Per call** means the call is charged even when it returns no match. Budget accordingly when you run a large batch.

## Two things worth knowing before you build a workflow

**1. Four operations need the Derrick Chrome extension.**

Enrich LinkedIn Profile, Get Follower Count, Find LinkedIn Company and Enrich LinkedIn Company read LinkedIn through your own browser session, so they need the Derrick Chrome extension installed and connected. Without it they return empty results. The other five operations work from the API alone.

**2. Phone lookups are expensive.**

Find Mobile Phone costs 150 credits per number found. Put a filter node before it rather than running it across a whole list.

## Resources

- [Derrick](https://derrick-app.com)
- [Derrick MCP server](https://derrick-app.com/mcp)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)

## License

[MIT](LICENSE)
