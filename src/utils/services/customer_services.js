export const extractCustomerFieldsInServiceCard = (data) => {
    const pkgSet = new Set();
    const postSet = new Set();
    const cityMap = new Map(); // key: city_name, value: city_nam

    for (const item of data) {
        // --- Unique Packages ---
        item.product_packages?.forEach(pkg => pkgSet.add(pkg));

        // --- Unique Posts ---
        const post = item.address?.[2];   // post index
        if (post) postSet.add(post);

        // --- Unique Cities ---
        const city = item.address?.[3];
        const cityId = item.address?.[4];
        if (city && cityId) cityMap.set(cityId, city);
    }

    const sortAZ = (arr) => arr.sort((a, b) => a.label.localeCompare(b.label, "en", { sensitivity: "base" }));

    const packages = sortAZ([...pkgSet].map(v => ({ label: v, value: v })));
    const posts = sortAZ([...postSet].map(v => ({ label: v, value: v })));
    const cities = sortAZ([...cityMap.entries()].map(([value, label]) => ({ label, value })));

    return { packages, posts, cities };
}

export const getUserProfileImagePath = (last_name) => {
    // Check if the user or user's last_name exists
    const firstLetter = last_name?.charAt(0)?.toUpperCase();

    if (firstLetter) {
        try {
            // Dynamically require the image based on the first letter
            return require(`../../assets/images/profile-tamp/${firstLetter}.png`);
        } catch (error) {
            // If the specific image doesn't exist, fallback to the common image
            return require('../../assets/images/profile-tamp/common.png');
        }
    } else {
        // If user or last_name is not defined, or the first letter could not be determined
        return require('../../assets/images/profile-tamp/common.png');
    }
}
