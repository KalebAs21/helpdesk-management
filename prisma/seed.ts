import { PrismaClient, Role, Priority, Category, TicketStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning up existing data...");
  await prisma.activity.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Hashing password...");
  const hashedPassword = await bcrypt.hash("password123", 10);

  console.log("Creating preseeded users...");

  // 1 System Administrator
  const admin = await prisma.user.create({
    data: {
      name: "System Administrator",
      email: "admin@company.com",
      password: hashedPassword,
      role: Role.ADMIN,
      department: null,
    },
  });

  // 2 Managers
  const manager1 = await prisma.user.create({
    data: {
      name: "Sarah Jenkins",
      email: "manager1@company.com",
      password: hashedPassword,
      role: Role.MANAGER,
    },
  });

  const manager2 = await prisma.user.create({
    data: {
      name: "David Miller",
      email: "manager2@company.com",
      password: hashedPassword,
      role: Role.MANAGER,
    },
  });

  // 3 Technical Staff
  const tech1 = await prisma.user.create({
    data: {
      name: "Alex Rivera",
      email: "tech1@company.com",
      password: hashedPassword,
      role: Role.TECHNICAL,
    },
  });

  const tech2 = await prisma.user.create({
    data: {
      name: "Brian Chen",
      email: "tech2@company.com",
      password: hashedPassword,
      role: Role.TECHNICAL,
    },
  });

  const tech3 = await prisma.user.create({
    data: {
      name: "Clara Vance",
      email: "tech3@company.com",
      password: hashedPassword,
      role: Role.TECHNICAL,
    },
  });

  // 3 Employees
  const emp1 = await prisma.user.create({
    data: {
      name: "Emily Watson",
      email: "emp1@company.com",
      password: hashedPassword,
      role: Role.EMPLOYEE,
    },
  });

  const emp2 = await prisma.user.create({
    data: {
      name: "James Marcus",
      email: "emp2@company.com",
      password: hashedPassword,
      role: Role.EMPLOYEE,
    },
  });

  const emp3 = await prisma.user.create({
    data: {
      name: "Olivia Davis",
      email: "emp3@company.com",
      password: hashedPassword,
      role: Role.EMPLOYEE,
    },
  });

  console.log("Users created successfully!");

  console.log("Creating 13 sample tickets with realistic history...");

  const sampleTicketsData = [
    {
      ticketNumber: "TKT-001",
      title: "VPN Access Error for Remote Setup",
      description: "Unable to authenticate with GlobalProtect VPN after the recent gateway software update. Need urgent access for client demo.",
      category: Category.IT_SUPPORT,
      priority: Priority.HIGH,
      status: TicketStatus.OPEN,
      createdBy: emp1,
      assignedTo: null,
      activities: [
        { user: emp1, type: "CREATED", detail: "Ticket created (high priority)" },
      ],
      comments: [],
    },
    {
      ticketNumber: "TKT-002",
      title: "4th Floor Conference Room AC Not Cooling",
      description: "The air conditioning unit in Room 402 is blowing warm air. Temperature inside reached 28°C during morning meeting.",
      category: Category.FACILITIES,
      priority: Priority.MEDIUM,
      status: TicketStatus.ASSIGNED,
      createdBy: emp2,
      assignedTo: tech2,
      activities: [
        { user: emp2, type: "CREATED", detail: "Ticket created (medium priority)" },
        { user: manager1, type: "ASSIGNED", detail: `Assigned to ${tech2.name}` },
      ],
      comments: [
        { user: manager1, content: "Brian, please inspect the condenser unit on the roof." },
      ],
    },
    {
      ticketNumber: "TKT-003",
      title: "Payroll Direct Deposit Account Change Request",
      description: "I updated my banking info in ADP portal last week but need confirmation that next Friday's paycheck will route to the new account.",
      category: Category.HR,
      priority: Priority.HIGH,
      status: TicketStatus.IN_PROGRESS,
      createdBy: emp3,
      assignedTo: tech1,
      activities: [
        { user: emp3, type: "CREATED", detail: "Ticket created (high priority)" },
        { user: manager2, type: "ASSIGNED", detail: `Assigned to ${tech1.name}` },
        { user: tech1, type: "STATUS_CHANGED", detail: "ASSIGNED -> IN_PROGRESS" },
      ],
      comments: [
        { user: tech1, content: "Verifying account routing info with payroll department now." },
      ],
    },
    {
      ticketNumber: "TKT-004",
      title: "Monitor Display Flicker on Dual Screen Setup",
      description: "Secondary Dell 27-inch monitor intermittently flashes black every 10-15 seconds. DisplayPort cable replaced already.",
      category: Category.IT_SUPPORT,
      priority: Priority.LOW,
      status: TicketStatus.RESOLVED,
      createdBy: emp1,
      assignedTo: tech3,
      activities: [
        { user: emp1, type: "CREATED", detail: "Ticket created (low priority)" },
        { user: manager1, type: "ASSIGNED", detail: `Assigned to ${tech3.name}` },
        { user: tech3, type: "STATUS_CHANGED", detail: "ASSIGNED -> IN_PROGRESS" },
        { user: tech3, type: "STATUS_CHANGED", detail: "IN_PROGRESS -> RESOLVED" },
      ],
      comments: [
        { user: tech3, content: "Replaced docking station firmware and updated graphics card drivers. Tested for 30 mins with no flickering." },
      ],
    },
    {
      ticketNumber: "TKT-005",
      title: "Broken Executive Desk Drawer Lock",
      description: "Key snapped inside the desk lock barrel on Desk #14. Sensitive confidential files locked inside.",
      category: Category.FACILITIES,
      priority: Priority.CRITICAL,
      status: TicketStatus.CLOSED,
      createdBy: emp2,
      assignedTo: tech2,
      activities: [
        { user: emp2, type: "CREATED", detail: "Ticket created (critical priority)" },
        { user: manager1, type: "ASSIGNED", detail: `Assigned to ${tech2.name}` },
        { user: tech2, type: "STATUS_CHANGED", detail: "ASSIGNED -> IN_PROGRESS" },
        { user: tech2, type: "STATUS_CHANGED", detail: "IN_PROGRESS -> RESOLVED" },
        { user: emp2, type: "STATUS_CHANGED", detail: "RESOLVED -> CLOSED" },
      ],
      comments: [
        { user: tech2, content: "Lock barrel drilled out and replaced with brand new key set handed directly to James." },
        { user: emp2, content: "Confirmed lock works smoothly now. Thanks Brian!" },
      ],
    },
    {
      ticketNumber: "TKT-006",
      title: "Health Insurance Card Re-issuance",
      description: "Physical health insurance card was lost. Requesting digital copy and new physical card to be dispatched.",
      category: Category.HR,
      priority: Priority.MEDIUM,
      status: TicketStatus.OPEN,
      createdBy: emp3,
      assignedTo: null,
      activities: [
        { user: emp3, type: "CREATED", detail: "Ticket created (medium priority)" },
      ],
      comments: [],
    },
    {
      ticketNumber: "TKT-007",
      title: "Main Server Room UPS Battery Warning",
      description: "UPS Unit B emitting audible alarm and showing battery replacement status LED. Immediate technician review required.",
      category: Category.IT_SUPPORT,
      priority: Priority.CRITICAL,
      status: TicketStatus.IN_PROGRESS,
      createdBy: emp2,
      assignedTo: tech1,
      activities: [
        { user: emp2, type: "CREATED", detail: "Ticket created (critical priority)" },
        { user: manager1, type: "ASSIGNED", detail: `Assigned to ${tech1.name}` },
        { user: tech1, type: "STATUS_CHANGED", detail: "ASSIGNED -> IN_PROGRESS" },
      ],
      comments: [
        { user: tech1, content: "New replacement battery cartridge ordered via rush shipping. Expected delivery by 2 PM." },
      ],
    },
    {
      ticketNumber: "TKT-008",
      title: "Ergonomic Chair Replacement Request",
      description: "Lumbar support adjustment handle is broken on current office chair causing severe back posture discomfort.",
      category: Category.FACILITIES,
      priority: Priority.LOW,
      status: TicketStatus.ASSIGNED,
      createdBy: emp1,
      assignedTo: tech3,
      activities: [
        { user: emp1, type: "CREATED", detail: "Ticket created (low priority)" },
        { user: manager2, type: "ASSIGNED", detail: `Assigned to ${tech3.name}` },
      ],
      comments: [],
    },
    {
      ticketNumber: "TKT-009",
      title: "New Employee Onboarding Laptop Provisioning",
      description: "Need MacBook Pro 16-inch with M3 chip, Developer tooling, Slack, and Jira setup for incoming Senior Engineer starting Monday.",
      category: Category.IT_SUPPORT,
      priority: Priority.HIGH,
      status: TicketStatus.RESOLVED,
      createdBy: emp3,
      assignedTo: tech2,
      activities: [
        { user: emp3, type: "CREATED", detail: "Ticket created (high priority)" },
        { user: manager1, type: "ASSIGNED", detail: `Assigned to ${tech2.name}` },
        { user: tech2, type: "STATUS_CHANGED", detail: "ASSIGNED -> IN_PROGRESS" },
        { user: tech2, type: "STATUS_CHANGED", detail: "IN_PROGRESS -> RESOLVED" },
      ],
      comments: [
        { user: tech2, content: "Laptop imaged, encrypted, and left at HR desk with temporary credentials." },
      ],
    },
    {
      ticketNumber: "TKT-010",
      title: "Annual Benefit Enrollment Information Packet",
      description: "Requesting breakdown of dental and vision coverage tiers prior to open enrollment deadline next month.",
      category: Category.HR,
      priority: Priority.LOW,
      status: TicketStatus.CLOSED,
      createdBy: emp1,
      assignedTo: tech3,
      activities: [
        { user: emp1, type: "CREATED", detail: "Ticket created (low priority)" },
        { user: manager2, type: "ASSIGNED", detail: `Assigned to ${tech3.name}` },
        { user: tech3, type: "STATUS_CHANGED", detail: "ASSIGNED -> IN_PROGRESS" },
        { user: tech3, type: "STATUS_CHANGED", detail: "IN_PROGRESS -> RESOLVED" },
        { user: emp1, type: "STATUS_CHANGED", detail: "RESOLVED -> CLOSED" },
      ],
      comments: [
        { user: tech3, content: "Sent comprehensive PDF benefits guide to Emily's email." },
        { user: emp1, content: "Received! All questions answered." },
      ],
    },
    {
      ticketNumber: "TKT-011",
      title: "Kitchenette Coffee Machine Water Leak",
      description: "Water leaking onto counter from bottom reservoir of espresso maker in 3rd floor breakroom.",
      category: Category.FACILITIES,
      priority: Priority.MEDIUM,
      status: TicketStatus.OPEN,
      createdBy: emp2,
      assignedTo: null,
      activities: [
        { user: emp2, type: "CREATED", detail: "Ticket created (medium priority)" },
      ],
      comments: [],
    },
    {
      ticketNumber: "TKT-012",
      title: "Software License Key for Figma Enterprise",
      description: "Design team needs 2 additional editor licenses assigned for upcoming product redesign sprint.",
      category: Category.OTHER,
      priority: Priority.MEDIUM,
      status: TicketStatus.ASSIGNED,
      createdBy: emp3,
      assignedTo: tech1,
      activities: [
        { user: emp3, type: "CREATED", detail: "Ticket created (medium priority)" },
        { user: manager1, type: "ASSIGNED", detail: `Assigned to ${tech1.name}` },
      ],
      comments: [],
    },
    {
      ticketNumber: "TKT-013",
      title: "Badge Reader Denial at Parking Structure Gate 2",
      description: "Keycard yields red error light when attempting entry after 7 PM.",
      category: Category.FACILITIES,
      priority: Priority.HIGH,
      status: TicketStatus.IN_PROGRESS,
      createdBy: emp1,
      assignedTo: tech2,
      activities: [
        { user: emp1, type: "CREATED", detail: "Ticket created (high priority)" },
        { user: manager2, type: "ASSIGNED", detail: `Assigned to ${tech2.name}` },
        { user: tech2, type: "STATUS_CHANGED", detail: "ASSIGNED -> IN_PROGRESS" },
      ],
      comments: [
        { user: tech2, content: "Re-synced security access permissions in Lenel S2 access control system." },
      ],
    },
  ];

  for (const t of sampleTicketsData) {
    const createdTicket = await prisma.ticket.create({
      data: {
        ticketNumber: t.ticketNumber,
        title: t.title,
        description: t.description,
        category: t.category,
        priority: t.priority,
        status: t.status,
        createdById: t.createdBy.id,
        assignedToId: t.assignedTo ? t.assignedTo.id : null,
      },
    });

    // Create activity history
    for (const act of t.activities) {
      await prisma.activity.create({
        data: {
          ticketId: createdTicket.id,
          userId: act.user.id,
          type: act.type as any,
          detail: act.detail,
        },
      });
    }

    // Create comments
    for (const comm of t.comments) {
      await prisma.comment.create({
        data: {
          ticketId: createdTicket.id,
          userId: comm.user.id,
          content: comm.content,
        },
      });
    }
  }

  console.log("Database successfully seeded with realistic tickets, activities, and comments!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
