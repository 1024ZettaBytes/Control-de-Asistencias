const express = require("express");
const router = express.Router();
// Models
const Employee = require("../db/models/employee");
const Attendence = require("../db/models/attendence");
// Route for getting employees
router.get("/empleados", async (req, res) => {
  if (req.session.userId) {
    console.log("-" + req.session.userType + "-");
    switch (req.session.userType) {
      case "GERENTE":
        {
          const employees = await Employee.find();
          res.render("admin/employeesList", {
            employees
          });
        }
        break;
      case "RH":
        console.log("Es RH o Empleado");
        res.redirect("../");
        break;
      case "EMPLEADO":
        console.log("Es RH o Empleado");
        res.redirect("../");
        break;
    }
  } else {
    res.redirect("login");
  }
});

// User wants to register an employee
router.get("/empleados/registrar", (req, res) => {
  if (req.session.userId) {
    switch (req.session.userType) {
      case "GERENTE":
        {
          if (req.session.datos) {
            const datosTemp = req.session.datos;
            delete req.session.datos;
            res.render("admin/registerEmployee", { datos: datosTemp });
          } else {
            res.render("admin/registerEmployee", { datos: {} });
          }
        }
        break;
      case "RH":
        console.log("Es RH o Empleado");
        res.redirect("../");
        break;
      case "EMPLEADO":
        console.log("Es RH o Empleado");
        res.redirect("../");
        break;
    }
  } else {
    res.redirect("../login");
  }

});

// Reciving new employee information to register
router.post("/empleados/registrar", async (req, res) => {
  if (req.session.userId) {
    switch (req.session.userType) {
      case "GERENTE":
        {
          const {
            nombre,
            puesto,
            direccion,
            telefono,
            fechaNacimiento,
            correo,
            rfc,
            fechaContrato,
            horaEntrada,
            horaSalida,
            lunes,
            martes,
            miercoles,
            jueves,
            viernes,
            sabado,
            domingo,
            vacacionesDisponibles,
            diasLibres,
            psw
          } = req.body;
          let semanaTrabajo = [];

          semanaTrabajo.push(lunes == null ? false : true);
          semanaTrabajo.push(martes == null ? false : true);
          semanaTrabajo.push(miercoles == null ? false : true);
          semanaTrabajo.push(jueves == null ? false : true);
          semanaTrabajo.push(viernes == null ? false : true);
          semanaTrabajo.push(sabado == null ? false : true);
          semanaTrabajo.push(domingo == null ? false : true);
          // Look for existing email

          const emailEmployee = await Employee.findOne({ correo: correo });

          if (emailEmployee) {
            let tempDatos = req.body;
            tempDatos.semanaTrabajo = semanaTrabajo;
            req.session.datos = tempDatos;
            res.flash("error_msg", `El correo ${correo} ya se encuentra registrado.`);
            res.redirect("registrar");
          } else {
            // Saving employee
            const newEmployee = new Employee({
              nombre,
              puesto,
              direccion,
              telefono,
              fechaNacimiento,
              correo,
              rfc,
              fechaContrato,
              horaEntrada,
              horaSalida,
              semanaTrabajo,
              vacacionesDisponibles,
              diasLibres
            });
            newEmployee.psw = await newEmployee.encryptPassword(psw);
            await newEmployee.save((err, doc) => {
              if (err) {
                let tempDatos = req.body;
                tempDatos.semanaTrabajo = semanaTrabajo;
                req.session.datos = tempDatos;
                res.flash(
                  "error_msg",
                  "Ocurrió un error al registrar al Empleado. Intente de nuevo."
                );
                res.redirect("registrar");
                console.error(err);
                return false;
              } else {
                delete req.session.datos;
                res.flash("success_msg", "¡Empleado registrado correctamente!");
                res.redirect("../empleados");
                console.log("[*] Employee saved.");
                return true;
              }
            });
          }
        }
        break;
      case "RH":
        console.log("Es RH o Empleado");
        res.redirect("../");
        break;
      case "EMPLEADO":
        console.log("Es RH o Empleado");
        res.redirect("../");
        break;
    }
  } else {
    res.redirect("../login");
  }

});
// Getting employees attendences
router.get("/empleados/asistencias", async (req, res) => {
  if (req.session.userId) {
    if (req.session.userType === "GERENTE") {
      const employees = await Employee.find({ puesto: "EMPLEADO" });
      if (req.session.selectedEmployee) {
        const sltdEmployee =req.session.selectedEmployee ;
        delete req.session.selectedEmployee;
        // Search all selected employee's attendences
        const employee = await Employee.findOne({
          folio: sltdEmployee
        });
      const empAttendences = await Attendence.find({
        idEmpleado: employee
      });
        res.render("admin/employeesAttendences", {employees, sltdEmployee, empAttendences});
      }
      else {
        res.render("admin/employeesAttendences", {employees, sltdEmployee:-1});
      }
    } else {
      res.redirect("../");
    }
  } else {
    res.redirect("../login");
  }
});
// Reciving selected employee for redirecting
router.post("/empleados/asistencias", (req, res)=>{
  if (req.session.userId) {
    if (req.session.userType === "GERENTE") {
      const {empleado} = req.body;
      req.session.selectedEmployee = empleado;
      res.redirect("../empleados/asistencias");
    } else {
      res.redirect("../");
    }
  } else {
    res.redirect("../login");
  }
});
module.exports = router;
