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

  // Store your Zendesk Base URL here for accessing it in the Table before env variables are set up
  const zendeskBaseUrl = "https://draft6776.zendesk.com";

  // Create states for Aiplane components
  const { values: asanaTaskFormValues } = useComponentState("asanaTaskForm");
  const openTicketsState = useComponentState("openTickets")
  const asanaTaskName = useComponentState("name")
  const zendeskTicketId = useComponentState("zendesk_id")
  const asanaNotes = useComponentState("notes")

  // Create a mutation to call the createAsanaTask task with parameters
  const { mutate: createAsanaTask } = useTaskMutation({
    slug: "create_asana_task",
    params: {
      ...asanaTaskFormValues,
    },
    onSuccess: (output) => {
      alert(`Created Asana Task ${output[0].id}`);
    },
    onError: (error) => {
      alert(`Failed creating Asana Task with error:`);
    },
  });

  // Update the assign ticket form whenever a record is selected in the Zendesk table
  useEffect(() => {
    const selectedRow = openTicketsState.selectedRow
    if (openTicketsState && selectedRow) {
      asanaTaskName.setValue(selectedRow.title)
      zendeskTicketId.setValue(selectedRow.id)
      asanaNotes.setValue(selectedRow.description)
    }
  }, [openTicketsState.selectedRow])

  // Create a template for generating the URL of the "Open in ZenDesk" button
  const openInZenDeskLink = (ticketId: string) => (zendeskBaseUrl + "/agent/tickets/" + ticketId)

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
        id="asanaTaskForm"
        onSubmit={() => {
          createAsanaTask();
          openTicketsState.clearSelection();
        }}
        resetOnSubmit
      >
        <TextInput id="zendesk_id" label="Zendesk ticket id" defaultDisabled />
        <TextInput id="name" label="Asana task name" required />
        <Select
          id="workspace_id"
          label="Asana workspace"
          task="list_asana_workspaces"
          outputTransform={(workspaces) =>
            workspaces.map((t) => ({
              value: t.id,
              label: t.name,
            }))
          }
          required
        />
        <Select
          id="assignee_id"
          label="Asana assignee"
          task="list_asana_users"
          outputTransform={(users) =>
            users.map((u) => ({
              value: u.id,
              label: u.name,
            }))
          }
          required
        />
        <DatePicker id="due_date" label="Due date" />
        <Textarea id="notes" label="Task Notes" />
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
