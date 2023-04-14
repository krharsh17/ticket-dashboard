import airplane from "airplane"
import axios from "axios";

export default airplane.task(
	{
		slug: "list_open_zendesk_tickets",
		name: "list-open-zendesk-tickets",
		// Set env variables for the task from Airplane's config variables
		envVars: {
			ZENDESK_DOMAIN: { config: "ZENDESK_DOMAIN" },
			ZENDESK_EMAIL: { config: "ZENDESK_EMAIL" },
			ZENDESK_PASSWORD: { config: "ZENDESK_PASSWORD" }
		}
	},
	// This is your task's entry point. When your task is executed, this
	// function will be called.
	async () => {

		// Define API input parameters to list only open tickets in ascending order of their creation
		const params = {
			query: "type:ticket status:open",
			sort_by: "created_at",
			sort_order: "asc",
		};

		// Use your Zendesk email and password via env variables to authenticate with the Zendesk API
		const auth = {
			username: process.env.ZENDESK_EMAIL,
			password: process.env.ZENDESK_PASSWORD,
		};

		// Send a response to the API and store its response
		let ticketsResponse = await axios
			.get(process.env.ZENDESK_DOMAIN + "/api/v2/search.json", { params, auth })


		// Extract raw tickets data from the response
		const ticketsRaw = ticketsResponse.data.results

		// Loop through the raw data to extract just the data you need
		const tickets = ticketsRaw.map(async t => {

			// Send another request to get the assignee's details
			let assigneeResponse = await axios
				.get(process.env.ZENDESK_DOMAIN + "/api/v2/users/" + t.assignee_id + ".json", { auth })

			// Send another request to get the requester's details
			let requesterResponse = await axios
				.get(process.env.ZENDESK_DOMAIN + "/api/v2/users/" + t.requester_id + ".json", { auth })


			return {
				id: t.id,
				title: t.subject,
				priority: t.priority,
				created_at: new Date(t.created_at),
				description: t.description,
				assignee_name: assigneeResponse.data.user.name,
				assignee_contact: assigneeResponse.data.user.email,
				customer_name: requesterResponse.data.user.name,
				customer_contact: requesterResponse.data.user.email
			}
		})

		// Return the tickets once all requests are complete
		return Promise.all(tickets)

	}
)

