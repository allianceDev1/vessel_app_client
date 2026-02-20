export const serviceCategoryListStretcher = (data = []) => {

    return data.map(({ coverage = [], ...category }) => {

        const coverageMap = coverage.reduce((acc, item) => {
            const { coverage_id, access, price_type } = item

            acc[coverage_id] = {
                access,
                price_type
            }

            return acc
        }, {})

        return {
            ...category,
            coverage: coverageMap
        }
    })

}