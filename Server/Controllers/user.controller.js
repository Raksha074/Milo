import User from "../Models/user.model.js"
import jwt from "jsonwebtoken"

export const getCurrentUser = async (req, res) => {
    try {
        const token = req.cookies?.token
        if (!token) {
            return res.status(200).json(null)
        }
        let verifyToken
        try {
            verifyToken = jwt.verify(token, process.env.JWT_SECRET)
        } catch {
            return res.status(200).json(null)
        }
        if (!verifyToken?.userId) {
            return res.status(200).json(null)
        }
        const user = await User.findById(verifyToken.userId)
        if (!user) {
            return res.status(200).json(null)
        }
        return res.status(200).json(user)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: `getCurrentUser error ${error}` })
    }
}


export const saveAssistant = async (req, res) => {
    try {
        const {
            assistantName,
            businessName,
            businessType,
            businessDescription,
            tone,
            theme,
            groqApiKey,
            pages,
        } = req.body

        const user = await User.findById(req.userId)
        if (!user) {
            return res.status(404).json({ message: "Failed to get current user" })
        }
        user.assistantName = assistantName;
        user.businessName = businessName;
        user.businessType = businessType;
        user.businessDescription = businessDescription;
        user.tone = tone;
        user.theme = theme;

        if (groqApiKey) {
            user.groqApiKey = groqApiKey;
        }
        user.groqStatus = "active";
        user.pages = pages || [];

        user.isSetupComplete = true
        await user.save()

        return res.status(200).json({
            message:
                "Assistant saved successfully",
            user
        })
    } catch (error) {
        return res.status(500).json({ message: `failed to save Assistant ${error}` })
    }
}