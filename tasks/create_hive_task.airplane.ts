import airplane from "airplane"
import axios from 'axios'

export default airplane.task(
	{
		slug: "create_hive_task",
		name: "create-hive-task",
		// Set env variables for the task from Airplane's config variables
		envVars: {
			HIVE_API_KEY: {config: "HIVE_API_KEY"},
			HIVE_USER_ID: {config: "HIVE_USER_ID"},
			HIVE_WORKSPACE_ID: {config: "HIVE_WORKSPACE_ID"},
		},
		// Set the parameters for the task. These will be captured automatically from an Airplane View's Form component when this task is called from that component
		parameters: {
			title: {
				type: "shorttext",
				name: "Title",
				description: "The title of the Hive task",
			},
			assignee_id: {
				type: "shorttext",
				name: "Assignee ID",
				description: "The ID of the assignee for the Hive task",
			},
			description: {
				type: "longtext",
				name: "Description",
				description: "Description for the Hive task",
				required: false,
			},
			deadline: {
				type: "date",
				name: "Deadline",
				description: "The deadline for the Hive task",
				required: false,
			},
		},
	},
	// This is your task's entrypoint. When your task is executed, this
	// function will be called.
	async (params) => {

		// Extract the API secrets from env variables
		const apiKey = process.env.HIVE_API_KEY ?? "";
		const userId = process.env.HIVE_USER_ID ?? "";
		const workspaceId = process.env.HIVE_WORKSPACE_ID ?? "";

		// If the API key is empty, send an empty response to the view
		if (apiKey === "") {
			return [];
		}

		// Define the options for the API request to the actions/create endpoint
		const options = {
			method: 'POST',
			url: 'https://app.hive.com/api/v1/actions/create',
			params: {user_id: userId},
			headers: {
			  accept: 'application/json',
			  'content-type': 'application/json',
			  api_key: apiKey
			},
			data: {
			  assignees: [params.assignee_id],
			  workspace: workspaceId,
			  title: params.title,
			  description: params.description,
			  deadline: params.deadline
			}
		  };


		// Send a request to create the Hive task 
		let response = await axios.request(options)

		// Return the result of the operation
		return response.data;
	}
)