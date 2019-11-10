const moongose = require('mongoose');
const Employee = require("../db/models/employee");
const Attendence = require("../db/models/attendence");
const moment = require('moment');

console.log(Date.now().toLocaleString());
moongose.connect('mongodb://localhost/sys-asistencias', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(db => console.log("[*] Db connected."))
    .catch(err => console.log("[ERROR] Db connection unsuccessfully."));
    const employee =  Employee.findOne({
        folio: 6
      }, async (err, doc)=>{
        const todaysDate = moment().add(-1,"d").format("YYYY-MM-DD");
        const tomorrowsDate = moment()
          .add(1, "d")
          .format("YYYY-MM-DD");
        // Search for todays employee attendence
        const usrAttendence = await Attendence.findOne({
          idEmpleado: doc
        });
        console.log(usrAttendence.idEmpleado);
      });
      
//     const employee = Employee.findOne();


// Employee.findOne({ folio: 2 },(err, doc) => {

//     if (err) {

//         console.log("No se encontró")

//     } else {

//         console.log("Se encontró")

//         const idEmpleado = doc;

//         const attendence = new Attendence({
//             idEmpleado,
//             checkIn: "",
//             type: "1",
//         })

//         attendence.save((err, doc) => {
//             if (err) {

//                 console.log("No se guardó la asistencia")

//             } else {

//                 console.log("Se guardó correctamente la asistencia")

//             }

//         });

//     }

// });


