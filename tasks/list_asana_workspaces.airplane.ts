import airplane from "airplane"

import asana from 'asana'

export default airplane.task(
	{
		slug: "list_asana_workspaces",
		name: "list-asana-workspaces",
		// Set env variables for the task from Airplane's config variables
		envVars: {
			ASANA_PERSONAL_ACCESS_TOKEN: { config: "ASANA_PERSONAL_ACCESS_TOKEN" }
		}
	},
	// This is your task's entrypoint. When your task is executed, this
	// function will be called.
	async () => {

		// Extract the API token from env variables
		const token = process.env.ASANA_PERSONAL_ACCESS_TOKEN ?? "";

		// If the API token is empty, send an empty response to the view
		if (token === "") {
			return [];
		}

		// Create a new Asana SDK client
		const client = asana.Client.create().useAccessToken(token);

		// Send a request to get all workspaces
		const result = await client.workspaces.getWorkspaces({ opt_pretty: true });

		// Return the list of Asana workspaces
		return result.data.map(elem => ({ id: elem.gid, name: elem.name }));
	}
)
