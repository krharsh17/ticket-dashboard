import airplane from "airplane"
import axios from 'axios'

export default airplane.task(
	{
		slug: "list_hive_users",
		name: "list-hive-users",
		// Set env variables for the task from Airplane's config variables
		envVars: {
			HIVE_API_KEY: {config: "HIVE_API_KEY"},
			HIVE_USER_ID: {config: "HIVE_USER_ID"},
			HIVE_WORKSPACE_ID: {config: "HIVE_WORKSPACE_ID"},
		},
	},
	// This is your task's entrypoint. When your task is executed, this
	// function will be called.
	async () => {
		// Extract the API secrets from env variables
		const apiKey = process.env.HIVE_API_KEY ?? "";
		const userId = process.env.HIVE_USER_ID ?? "";
		const workspaceId = process.env.HIVE_WORKSPACE_ID ?? "";


		// If the API key is empty, send an empty response to the view
		if (apiKey === "") {
			return [];
		}

		// Define the options for the API request to the workspaceId/users endpoint
		const options = {
			method: 'GET',
			url: `https://app.hive.com/api/v1/workspaces/${workspaceId}/users`,
			params: {user_id: userId},
			headers: {accept: 'application/json', api_key: apiKey}
		  };

		// Send a request to get all users in the workspace
		let response = await axios.request(options)

		// Return the list of Hive users in the workspace
		return response.data.map(user => ({ id: user.id, name: user.fullName }))
	}
)