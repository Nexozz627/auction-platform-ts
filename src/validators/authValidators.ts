import { z } from 'zod';

//the zod making basic input verification for the classic register

const registerSchema = z.object({
    username: z.string()
        .min(3, "Username must be at least 3 characters long"),
    email: z
        .email("Invalid email format"),
    firstName: z.string()
        .min(1, "First name is required"),
    lastName: z.string()
        .min(1, "Last name is required"),
    password: z.string()
        .min(8, "Password must be at least 8 characters long"),
});

export { registerSchema };