const mongoose = require("mongoose");
const { Quote } = require("../models/postModel");

const getQuotes = async (req, res) => {
  try {
    const quotes = await Quote.find();
    if (!quotes.length) {
      return res.status(404).json({ message: "No quotes found" });
    }
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createQuotes = async (req, res) => {
  const { text } = req.body;
  if (!text || text.trim() === "") {
    return res.status(400).json({ message: "Quote text is required" });
  }

  try {
    const newQuote = new Quote({ text });
    await newQuote.save();
    res.status(201).json({ message: "create successfully", newQuote });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateQuotes = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid quote ID" });
  }

  if (!text || text.trim() === "") {
    return res.status(400).json({ message: "Quote text is required" });
  }

  try {
    const updatedQuote = await Quote.findByIdAndUpdate(
      id,
      { text },
      { new: true, runValidators: true, upsert: false }
    );

    if (!updatedQuote) {
      return res.status(404).json({ message: "Quote not found" });
    }

    res.json({ message: "update successfully", updatedQuote });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteQuotes = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid quote ID" });
  }

  try {
    const deletedQuote = await Quote.findByIdAndDelete(id);

    if (!deletedQuote) {
      return res.status(404).json({ message: "Quote not found" });
    }

    res.json({ message: "Delete quote successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getQuotes,
  createQuotes,
  updateQuotes,
  deleteQuotes,
};
