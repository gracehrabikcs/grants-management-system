export const loadTaskEvents = async () => {
  const res = await fetch("/data/grantDetails.json");
  const grantData = await res.json();

  let events = [];

  grantData.forEach((grant) => {
    const grantTitle = grant.title;
    const tracking = grant.tracking || {};

    Object.keys(tracking).forEach((section) => {
      tracking[section].forEach((task) => {
        if (task.deadline) {
          events.push({
            id: `${grant.id}-${section}-${task.id}`,
            title: `${grantTitle}: ${task.name}`,
            section,
            grantId: grant.id,
            taskId: task.id,
            deadline: task.deadline,
            start: task.deadline,
            end: task.deadline,
          });
        }
      });
    });
  });

  return events;
};
