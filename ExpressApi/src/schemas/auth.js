import Joi from 'joi';

export const registerSchema = Joi.object({
    username: Joi.string().required().trim().messages({
        "any.required": "Username la truong bat buoc",
        "string.empty": "Username khong duoc de trong",
        "string.trim": "Username khong duoc chua khoang trang"
    }),
    email: Joi.string().email().required().messages({
        "any.required": "Email la truong bat buoc",
        "string.email": "Email khong dung dinh dang",
        "string.empty": "Email khong duoc de trong"
    }),
    password: Joi.string().required().max(20).trim().messages({
        "any.required": "Password la truong bat buoc",
        "string.max": "Password toi da 20 ky tu",
        "string.empty": "Password khong duoc de trong"
    }),
    confirmPassword: Joi.string().required().equal(Joi.ref("password")).messages({
        "any.required": "Confirm Password la bat buoc",
        "any.only": "Confirm password khong trung khop",
        "string.empty": "Confirm password khong duoc de trong"
    }),
    age: Joi.number().max(100).messages({
        "number.max": "Tuoi khong hop le"
    })

})