const express = require("express");
const router = express.Router();
const moment = require("moment");
// Models
const Employee = require("../db/models/employee");
const Attendence = require("../db/models/attendence");
// Employee index route
router.get("/empleado", async (req, res) => {
  if (req.session.userId) {
    if (req.session.userType === "EMPLEADO") {
      const employee = await Employee.findOne({
        folio: req.session.userId
      });
      const todaysDate = moment().add(-1,"d").format("YYYY-MM-DD");
      const tomorrowsDate = moment()
        .add(1, "d")
        .format("YYYY-MM-DD");
      // Search for todays employee attendence
      const usrAttendence = await Attendence.findOne({
        fecha: { $gte: todaysDate, $lte: tomorrowsDate },
        idEmpleado: employee
      });
      console.log(usrAttendence);
      let attndcInfo = {};
      if (usrAttendence) {
          console.log("Asistencia encontrada");
        attndcInfo.checked = true;
        req.session.attendenceState = "checked";
      } else {
        // Attendence haven't been checked

        // Check if is on work time
        if (
          moment().isSameOrAfter(
            moment(todaysDate + " " + employee.horaEntrada + ":00")
          ) &&
          moment().isBefore(
            moment(todaysDate + " " + employee.horaSalida + ":00")
          )
        ) {
          // Is on work time

          // Check if is on time < 10 minutes
          if (
            moment().isBefore(
              moment(todaysDate + " " + employee.horaEntrada + ":00").add(
                10,
                "m"
              )
            )
          ) {
            // Is on time
            attndcInfo.onTime = true;
            req.session.attendenceState = "onTime";
          } else {
            // Is on work time but delayed
            attndcInfo.delayed = true;
            req.session.attendenceState = "delayed";
          }
        } else {
          // Is not on work time
          attndcInfo.noWorkTime = true;
          req.session.attendenceState = "noWorkTime";
        }
      }
      res.render("employee/indexEmployee", { attndcInfo });
    } else res.redirect("../");
  } else res.redirect("../login");
});
// When employee click on "Registrar asistencia" or "Registrar asistencia con retraso" button
router.post("/empleado/registrarAsistencia", async (req, res) => {
  if (req.session.userId) {
    if (req.session.userType === "EMPLEADO") {
      const attndcState = req.session.attendenceState;
      if (attndcState != "checked" || attndcState !="noWorkTime") {
        await Employee.findOne({ folio: req.session.userId }, async (err, doc) => {
          if (err) {
            console.log(
              "No se encontró el empleado durante la creación de asistencia."
            );
            res.redirect("../empleado");
          } else {
            const idEmpleado = doc;
            const type = req.session.attendenceState === "onTime" ? 1 : 2;
            const attendence = new Attendence({
              idEmpleado,
              type
            });

            await attendence.save((err, doc) => {
              if (err) {
                res.flash("error_msg", "Ocurrió un error al registrar su asistencia. Intente nuevamente.");
                console.log("No se guardó la asistencia");
                res.redirect("../empleado");
              } else {
                console.log("Se guardó correctamente la asistencia");
                res.redirect("../empleado");
              }
            });
          }
        });
      } else {
        res.redirect("../empleado");
      }
    } else res.redirect("../");
  } else res.redirect("../login");
});
module.exports = router;
