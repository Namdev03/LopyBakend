import Conversation from "../Model/Conversation.model.js";
import Message from "../Model/Message.model.js";

export const sendMessage = async (req, res) => {
    try {
        const userId = req.id;
        const receiverId = req.params.id;
        const {message} = req.body;
        console.log("BODY:", req.body);
        console.log("MESSAGE:", req.body?.message);
        console.log(req.body?.message);

        if (!message?.trim()) {
            return res.status(400).json({
                message: "Message is required",
                status:false
            });
        }

        let conversation = await Conversation.findOne({
            participants: { $all: [userId, receiverId] }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [userId, receiverId]
            });
        }

        const newMessage = await Message.create({
            sender: userId,
            receiver: receiverId,
            message
        });

        conversation.messages.push(newMessage._id);

        await conversation.save();

        return res.status(201).json({
            message: "Message sent successfully",
            newMessage,
            status:true
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};
export const getmessage = async (req, res) => {
    try {
        const userId = req.id;
        const senderId = req.params.id;
        let conversasation = await Conversation.findOne({
            participants: { $all: [userId, senderId] }
        })
        if (!conversasation) {
            return res.status(200).json({
                message: "Start messaging"
            })
        }
        return res.status(200).json({
            message: conversasation.messages
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
}