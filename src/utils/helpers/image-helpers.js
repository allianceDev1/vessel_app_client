export const getUserProfileImagePath = (last_name) => {
    // Check if the user or user's last_name exists
    const firstLetter = last_name?.charAt(0)?.toUpperCase();

    try {
        return firstLetter
            ? require(`../../assets/images/profile-tamp/${firstLetter}.png`)
            : require('../../assets/images/profile-tamp/common.png');
    } catch {
        return require('../../assets/images/profile-tamp/common.png');
    }
}