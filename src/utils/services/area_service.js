export const listInactiveAreaWorker = (allWorkers, activeWorkers) => {
    const activeSet = new Set(activeWorkers?.map(w => w.worker_uuid));

    return allWorkers.filter(w => !activeSet.has(w.worker_uuid)).map(w => ({ label: w.full_name, value: w.worker_uuid }));
}