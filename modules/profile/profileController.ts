import Profile, { IProfile } from "./models/profile"


export async function usernameAvailable(username: string): Promise<boolean> {
    const existing = await Profile.findOne({ username: username.toLowerCase()});
    return !!!existing;
}

export async function updateProfile(userId: string, profileData: Partial<IProfile>): Promise<IProfile | null> {
    return Profile.findByIdAndUpdate(userId, profileData, { new: true, upsert: false });
}