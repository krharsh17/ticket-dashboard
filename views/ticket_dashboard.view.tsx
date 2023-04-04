import {
  Stack,
  Table,
  Heading,
  useComponentState,
  Select,
  TextInput,
  Form,
  DatePicker,
  Textarea,
  useTaskMutation,
  useTaskQuery,
  Divider,
  Loader,
  Text,
  Card
} from "@airplane/views";
import airplane from "airplane";
import { useEffect } from "react";


const TicketDashboard = () => {

  // Store your Zendesk subdomain here for accessing it in the Table before env variables are set up
  const zendeskSubdomain = "draft6776";

  // Create states for Airplane components
  const { values: hiveTaskFormValues } = useComponentState("hiveTaskForm");
  const openTicketsState = useComponentState("openTickets")
  const hiveTaskTitle = useComponentState("title")
  const zendeskTicketId = useComponentState("zendesk_id")
  const hiveTaskDescription = useComponentState("description")

  // Create a mutation to call the createHiveTask task with parameters
  const { mutate: createHiveTask } = useTaskMutation({
    slug: "create_hive_task",
    params: {
      ...hiveTaskFormValues,
    },
    onSuccess: (output) => {
      alert(`Created Hive Task ${output[0].id}`);
    },
    onError: (error) => {
      alert(`Failed creating Hive Task with error:`);
    },
  });

  // Update the assign ticket form whenever a record is selected in the Zendesk table
  useEffect(() => {
    const selectedRow = openTicketsState.selectedRow
    if (openTicketsState && selectedRow) {
      hiveTaskTitle.setValue(selectedRow.title)
      zendeskTicketId.setValue(selectedRow.id)
      hiveTaskDescription.setValue(selectedRow.description)
    }
  }, [openTicketsState.selectedRow])

  // Create a template for generating the URL of the "Open in ZenDesk" button
  const openInZenDeskLink = (ticketId: string) => ("https://" + zendeskSubdomain + ".zendesk.com/agent/tickets/" + ticketId)

  return (
    <Stack>
      <Heading>Ticketing dashboard</Heading>
      <Table
        id={"openTickets"}
        title="Open Zendesk Tickets"
        task="list_open_zendesk_tickets"
        rowSelection="single"
        columns={openConversationsCols}
        rowActions={{
          variant: "subtle",
          href: (row) => openInZenDeskLink(row.id),
          label: "Open in ZenDesk",
        }}
      />

      <Heading level={5}>Assign a Ticket</Heading>
      <Form
        id="hiveTaskForm"
        onSubmit={() => {
          createHiveTask();
          openTicketsState.clearSelection();
        }}
        resetOnSubmit
      >
        <TextInput id="zendesk_id" label="Zendesk ticket id" defaultDisabled />
        <TextInput id="title" label="Hive task title" required />
        <Select
          id="assignee_id"
          label="Hive assignee"
          task="list_hive_users"
          outputTransform={(users) =>
            users.map((u) => ({
              value: u.id,
              label: u.name,
            }))
          }
          required
        />
        <DatePicker id="deadline" label="Deadline" />
        <Textarea id="description" label="Task Description" />
      </Form>
      <Divider labelPosition="center" />
      <Metrics />
    </Stack>
  );
};

// Create a component to load and display the metrics
const Metrics = () => {
  // Create a query to call the fetch_zendesk_metrics task
  const { output, loading, error } = useTaskQuery({ slug: "fetch_zendesk_metrics" });

  if (loading) {
    return <Loader />;
  }
  if (error) {
    return <Text color="error">{error.message}</Text>;
  }
  return (
    <>
    <Heading level={1}>Overall Metrics</Heading>
      <Stack direction="row">
        <Card>
          <Heading level={2}>Avg First Response Time</Heading>
          <Text>{`${output.avgFirstResponseTime} minutes`}</Text>
        </Card>
        <Card>
          <Heading level={2}>Avg First Resolution Time</Heading>
          <Text>{`${output.avgFirstResolutionTime} minutes`}</Text>
        </Card>
        <Card>
          <Heading level={2}>Avg Time to Resolve</Heading>
          <Text>{`${output.avgTimeToResolve || 0} minutes`}</Text>
        </Card>
        <Card>
          <Heading level={2}>Avg Replies Per Ticket</Heading>
          <Text>{`${output.avgRepliesPerTicket} replies`}</Text>
        </Card>
      </Stack>
    </>
  );
}

const openConversationsCols = [
  { label: "ID", accessor: "id" },
  { label: "Title", accessor: "title" },
  { label: "Created At", accessor: "created_at" },
  { label: "Description", accessor: "description" },
  { label: "Assignee Name", accessor: "assignee_name" },
  { label: "Assignee Contact", accessor: "assignee_contact" },
  { label: "Customer Name", accessor: "customer_name" },
  { label: "Customer Contact", accessor: "customer_contact" },
];

export default airplane.view(
  {
    slug: "ticket_dashboard",
    name: "Ticket dashboard",
  },
  TicketDashboard
);