import airplane from "airplane"
import axios from "axios";

export default airplane.task(
	{
		slug: "fetch_zendesk_metrics",
		name: "fetch-zendesk-metrics",
		envVars: {
			ZENDESK_DOMAIN: { config: "ZENDESK_DOMAIN" },
			ZENDESK_EMAIL: { config: "ZENDESK_EMAIL" },
			ZENDESK_PASSWORD: { config: "ZENDESK_PASSWORD" }
		}
	},
	// This is your task's entry point. When your task is executed, this
	// function will be called.
	async () => {
		const params = {
			query: "type:ticket",
			sort_by: "created_at",
			sort_order: "asc",
		};

		const auth = {
			username: process.env.ZENDESK_EMAIL,
			password: process.env.ZENDESK_PASSWORD,
		};

		let metricsResponse = await axios
			.get(process.env.ZENDESK_DOMAIN + "/api/v2/ticket_metrics", { params, auth })

		const metricsRaw = metricsResponse.data.ticket_metrics

		console.log(metricsRaw)

		// Average First Response Time
		let avgFirstResponseTime = 0

		// Average First Resolution Time
		let avgFirstResolutionTime = 0

		// Average Time to Resolve
		let avgTimeToResolve = 0

		// Average Replies per Ticket
		let avgRepliesPerTicket = 0

		metricsRaw.forEach((ticketMetrics) => {
			avgFirstResponseTime += ticketMetrics.reply_time_in_minutes.business || 0

			avgFirstResolutionTime += ticketMetrics.first_resolution_time_in_minutes.business || 0

			avgTimeToResolve += ticketMetrics.full_resolution_time_in_minutes.business || 0
			
			avgRepliesPerTicket += ticketMetrics.replies
		})

		avgFirstResponseTime /= metricsRaw.length
		avgFirstResolutionTime /= metricsRaw.length
		avgTimeToResolve /= metricsRaw.length
		avgRepliesPerTicket /= metricsRaw.length


		// Calculate metrics
		// Update view
		// Write article and submit

		// You can return data to show output to users.
		// Output documentation: https://docs.airplane.dev/tasks/output
		return {
			avgFirstResponseTime,
			avgFirstResolutionTime,
			avgTimeToResolve,
			avgRepliesPerTicket
		};
	}
)
