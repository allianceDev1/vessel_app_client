export const groupAndSortByScheduleDate = (data) => {

    const result = Object.values(
        data.reduce((acc, item) => {
            const dateKey = item.schedule_slot.slot_start_time.split("T")[0];

            if (!acc[dateKey]) {
                acc[dateKey] = [];
            }

            acc[dateKey].push(item);
            return acc;
        }, {})
    )
        // sort items inside each date by time
        .map(group =>
            group.sort(
                (a, b) =>
                    new Date(a.schedule_slot.slot_start_time) -
                    new Date(b.schedule_slot.slot_start_time)
            )
        )
        // sort date groups old → new
        .sort(
            (a, b) =>
                new Date(a[0].schedule_slot.slot_start_time) -
                new Date(b[0].schedule_slot.slot_start_time)
        );

    return result
}

