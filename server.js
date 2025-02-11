// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// // MongoDB Connection
// mongoose.connect('mongodb://localhost:27017/studentDB', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// });

mongoose
  .connect("mongodb://localhost:27017/studentDB")
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Student Schema
const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  rollno: {
    type: String,
    required: true,
    unique: true,
  },
  cgpa: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
    enum: ["Male", "Female", "Other"],
  },
  course: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  batch: {
    type: String,
    required: true,
  },
  disability: {
    type: Boolean,
    default: false,
  },
  active_backlogs: {
    type: Boolean,
    default: false,
  },
  backlogs_history: {
    type: Boolean,
    default: false,
  },
});

const Student = mongoose.model('Student', studentSchema);


//   app.get('/api/student/:rollNumber', async (req, res) => {
//     try {
//       const student = await Student.findOne({ rollNumber: req.params.rollNumber });
//       if (!student) {
//         return res.status(404).json({ message: 'Student not found' });
//       }
//       res.json(student);
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   });

//   app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
//   });



app.post("/students", async (req, res) => {
    try {
        const students = req.body.data.students;
        const insertedStudents = await Student.insertMany(students);
        res.status(201).json({ success: true, message: "Students added successfully", students: insertedStudents });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error adding students", error: error.message });
    }
});

// POST endpoint to fetch multiple students by roll numbers



app.post("/api/students/fetch", async (req, res) => {
  try {
    const { rollNumbers } = req.body;

    // Validate request body
    if (!rollNumbers || !Array.isArray(rollNumbers)) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of roll numbers",
      });
    }

    // Find all students with matching roll numbers
    const students = await Student.find({
      rollno: { $in: rollNumbers },
    });

    // Check if any students were found
    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No students found with the provided roll numbers",
      });
    }

    // Create a map of found and not found roll numbers
    const foundRollNumbers = students.map((student) => student.rollNumber);
    const notFoundRollNumbers = rollNumbers.filter(
      (roll) => !foundRollNumbers.includes(roll)
    );

    res.status(200).json({
      success: true,
      data: {
        students,
        summary: {
          totalRequested: rollNumbers.length,
          found: students.length,
          notFound: notFoundRollNumbers.length,
          notFoundRollNumbers,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Sample endpoint to add a student (for testing)
app.post("/api/students", async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json({
      success: true,
      data: student,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
