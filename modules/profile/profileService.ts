import Profile, { IProfile } from "./models/profile"


export async function usernameAvailable(username: string): Promise<boolean> {
    const existing = await Profile.findOne({ username: username.toLowerCase() });
    return !!!existing;
}

export async function updateProfile(userId: string, profileData: Partial<IProfile>): Promise<IProfile | null> {
    let data: any = profileData;
    if (data.user) {
        delete data.user; // Prevent user from changing user field
    }
    if (data.coins) {
        delete data.coins; // Prevent user from changing coins field
    }
    if (data.username) {
        data.displayName = data.username;
        data.username = data.username.toLowerCase();
    }
    return Profile.findByIdAndUpdate(userId, data, { new: true, upsert: false });
}