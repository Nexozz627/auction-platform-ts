import {z} from 'zod';

const registerSchema = z.object({
    email:z.string().email("Invalid email format"),
});

export { registerSchema };