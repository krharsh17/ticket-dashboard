import airplane from "airplane"
import axios from 'axios'

export default airplane.task(
	{
		slug: "list_asana_users",
		name: "list-asana-users",
		// Set env variables for the task from Airplane's config variables
		envVars: {
			ASANA_PERSONAL_ACCESS_TOKEN: { config: "ASANA_PERSONAL_ACCESS_TOKEN" }
		},
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

		// You'll use the Asana API here instead of the SDK because the SDK's method for listing users does not work without a workspace or team ID, while the API works perfectly
		const options = {
			method: 'GET',
			url: 'https://app.asana.com/api/1.0/users',
			headers: {
				accept: 'application/json',
				authorization: 'Bearer ' + token
			}
		};

		// Send a request to get all users
		let response = await axios.request(options)

		// Return the list of Asana workspaces
		return response.data.data.map(user => ({ id: user.gid, name: user.name }))
	}
)
