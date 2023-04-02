import airplane from "airplane"
import asana from 'asana'

export default airplane.task(
	{
		slug: "create_asana_task",
		name: "create-asana-task",
		// Set env variables for the task from Airplane's config variables
		envVars: {
			ASANA_PERSONAL_ACCESS_TOKEN: { config: "ASANA_PERSONAL_ACCESS_TOKEN" }
		},
		// Set the parameters for the task. These will be captured automatically from an Airplane View's Form component when this task is called from that component
		parameters: {
			name: {
				type: "shorttext",
				name: "Name",
				description: "The name of the Asana task",
			},
			workspace_id: {
				type: "shorttext",
				name: "Workspace ID",
				description: "The workspace ID for the Asana task",
			},
			assignee_id: {
				type: "shorttext",
				name: "Assignee ID",
				description: "The ID of the assignee for the Asana task",
			},
			notes: {
				type: "longtext",
				name: "Notes",
				description: "Notes for the Asana task",
				required: false,
			},
			due_date: {
				type: "date",
				name: "Due On",
				description: "The due date of the Asana task",
				required: false,
			},
		},
	},
	// This is your task's entrypoint. When your task is executed, this
	// function will be called.
	async (params) => {

		// Extract the API token from env variables
		const token = process.env.ASANA_PERSONAL_ACCESS_TOKEN ?? "";

		// If the API token is empty, notify the user
		if (token === "") {
			return { message: "Invalid API Key" };
		}

		// Create a new Asana SDK client
		const client = asana.Client.create().useAccessToken(token);

		// Create a task-scoped variable to hold the operation result
		let result

		// Create the task via the SDK
		try {
			result = await client.tasks.createTask(
				{
					name: params.name,
					assignee: params.assignee_id,
					workspace: params.workspace_id,
					due_on: params.due_date,
					notes: params.notes
				}
			);

		} catch (e) {
			// Log errors, if any encountered
			console.log(JSON.stringify(e))
		}

		// Return the result of the create-task operation
		return result;
	}
)
