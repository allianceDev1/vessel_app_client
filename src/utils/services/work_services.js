import moment from "moment";



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

/**
 * Generate full month running dataset from daily records
 * @param {String} monthStr  -> "YYYY-MM"
 * @param {Array} dailyData  -> [{date:"YYYY-MM-DD", km:Number}]
 *  @returns Array<Week[]>
 */
export const generateMonthlyRunningCalendar = (monthStr, dailyData = []) => {
    const monthStart = moment(monthStr, "YYYY-MM").startOf("month");
    const monthEnd = moment(monthStr, "YYYY-MM").endOf("month");
    const today = moment().startOf("day");

    // fast lookup map from DB
    const kmMap = dailyData.reduce((acc, item) => {
        acc[item.date] = item.value;
        return acc;
    }, {});

    const startCalendar = monthStart.clone().startOf("week"); // Sunday
    const endCalendar = monthEnd.clone().endOf("week"); // Saturday

    const day = startCalendar.clone();
    const editStartDate = today.clone().subtract(3, "days"); // today - 3 days
    const calendar = [];

    while (day.isBefore(endCalendar)) {
        const week = [];

        for (let i = 0; i < 7; i++) {
            const dateStr = day.format("YYYY-MM-DD");
            const isWithinEditRange =
                day.isSameOrAfter(editStartDate) && day.isSameOrBefore(today);

            week.push({
                date: dateStr,
                day: day.date(),
                weekdayIndex: day.day(),
                km: kmMap[dateStr] ?? 0,
                isCurrentMonth: day.month() === monthStart.month(),
                isToday: day.isSame(today, "day"),
                isDisabled: day.isAfter(today),
                isEditEnabled: isWithinEditRange
            });

            day.add(1, "day");
        }

        calendar.push(week);
    }

    return calendar;
};


/**
 * Generate monthly report
 * @param {Array<{date:string,value:number}>} data
 */
export const generateMonthlyRunningReport = (data = []) => {
    if (!Array.isArray(data)) {
        throw new Error("Invalid data format");
    }

    const result = data.reduce(
        (acc, item) => {
            const value = Number(item?.value) || 0;

            // total
            acc.total += value;

            // highest
            if (value > acc.highest) acc.highest = value;

            // valid day count (ignore zero)
            if (value > 0) {
                acc.validDays += 1;
                acc.validTotal += value;
            }

            return acc;
        },
        {
            total: 0,
            highest: 0,
            validDays: 0,
            validTotal: 0
        }
    );

    const average =
        result.validDays === 0 ? 0 : result.validTotal / result.validDays;

    return {
        total: result.total,
        highest: result.highest,
        average: Number(average.toFixed(2)),
        validDays: result.validDays
    };
}


export const convertEligibilityToArray = (data) => {
  return Object.entries(data)
    .filter(([key]) => key !== "product_id") // skip product_id
    .map(([key, value]) => {
      const [status, note = null] = value; // note optional
      return [key, status, note];
    });
};

