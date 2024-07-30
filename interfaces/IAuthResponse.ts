export interface IAuthResponse {
    success: boolean;
    accessToken?: string;
    refreshToken?: string;
    message?: string;
    errors?: string[];
}