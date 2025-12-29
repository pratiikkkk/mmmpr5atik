const express = require('express');
const router = express.Router();

const oracleClient = require('../oracleClient');
const oracledb = require('oracledb');

// GET /api/employee/:empno
router.get('/:empno', async (req, res, next) => {
	try {
		const empno = req.params.empno;
		const binds = {
			p_empno: { val: empno, type: oracledb.STRING, dir: oracledb.BIND_IN },
			p_result: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
		};
		const result = await oracleClient.executeProcedure({
			procedure: `PKG_EMP_MASTER.PROC_GET_EMP_BY_NO(
				p_empno => :p_empno,
				p_result => :p_result
			)`,
			binds,
			options: { outFormat: oracledb.OUT_FORMAT_OBJECT }
		});
		const cursor = result.outBinds.p_result;
		const rows = [];
		let row;
		while ((row = await cursor.getRow())) {
			rows.push(row);
		}
		await cursor.close();
		res.json({ statusCode: 0, message: 'OK', data: rows });
	} catch (err) {
		next(err);
	}
});

// GET /api/employee/list
router.get('/list', async (req, res, next) => {
	try {
		const binds = {
			p_result: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
		};
		const result = await oracleClient.executeProcedure({
			procedure: `PKG_EMP_MASTER.PROC_GET_EMP_LIST(
				p_result => :p_result
			)`,
			binds,
			options: { outFormat: oracledb.OUT_FORMAT_OBJECT }
		});
		const cursor = result.outBinds.p_result;
		const rows = [];
		let row;
		while ((row = await cursor.getRow())) {
			rows.push(row);
		}
		await cursor.close();
		res.json({ statusCode: 0, message: 'OK', data: rows });
	} catch (err) {
		next(err);
	}
});
// PUT /api/employee/update
router.put('/update', async (req, res, next) => {
	try {
		// Example: Accepting employee fields from request body
		const { empno, empname, erpusername, apiusername, active } = req.body;
		const binds = {
			p_empno: { val: empno, type: oracledb.STRING, dir: oracledb.BIND_IN },
			p_empname: { val: empname, type: oracledb.STRING, dir: oracledb.BIND_IN },
			p_erpusername: { val: erpusername, type: oracledb.STRING, dir: oracledb.BIND_IN },
			p_apiusername: { val: apiusername, type: oracledb.STRING, dir: oracledb.BIND_IN },
			p_active: { val: active, type: oracledb.STRING, dir: oracledb.BIND_IN },
			p_status: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
			p_message: { type: oracledb.STRING, dir: oracledb.BIND_OUT }
		};
		const result = await oracleClient.executeProcedure({
			procedure: `PKG_EMP_MASTER.PROC_UPDATE_EMP_MASTER(
				p_empno => :p_empno,
				p_empname => :p_empname,
				p_erpusername => :p_erpusername,
				p_apiusername => :p_apiusername,
				p_active => :p_active,
				p_status => :p_status,
				p_message => :p_message
			)`,
			binds,
			options: {}
		});
		res.json({
			statusCode: result.outBinds.p_status || 0,
			message: result.outBinds.p_message || 'OK'
		});
	} catch (err) {
		next(err);
	}
});

// POST /api/employee/save
router.post('/save', async (req, res, next) => {
	try {
		// Example: Accepting employee fields from request body
		const { empno, empname, erpusername, apiusername, active } = req.body;
		const binds = {
			p_empno: { val: empno, type: oracledb.STRING, dir: oracledb.BIND_IN },
			p_empname: { val: empname, type: oracledb.STRING, dir: oracledb.BIND_IN },
			p_erpusername: { val: erpusername, type: oracledb.STRING, dir: oracledb.BIND_IN },
			p_apiusername: { val: apiusername, type: oracledb.STRING, dir: oracledb.BIND_IN },
			p_active: { val: active, type: oracledb.STRING, dir: oracledb.BIND_IN },
			p_status: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
			p_message: { type: oracledb.STRING, dir: oracledb.BIND_OUT }
		};
		const result = await oracleClient.executeProcedure({
			procedure: `PKG_EMP_MASTER.PROC_SAVE_EMP_MASTER(
				p_empno => :p_empno,
				p_empname => :p_empname,
				p_erpusername => :p_erpusername,
				p_apiusername => :p_apiusername,
				p_active => :p_active,
				p_status => :p_status,
				p_message => :p_message
			)`,
			binds,
			options: {}
		});
		res.json({
			statusCode: result.outBinds.p_status || 0,
			message: result.outBinds.p_message || 'OK'
		});
	} catch (err) {
		next(err);
	}
});

// PUT /api/employee/update
router.put('/update', async (req, res, next) => {
	try {
		// Example: Accepting employee fields from request body
		const { empno, empname, erpusername, apiusername, active } = req.body;
		const binds = {
			p_empno: { val: empno, type: oracledb.STRING, dir: oracledb.BIND_IN },
			p_empname: { val: empname, type: oracledb.STRING, dir: oracledb.BIND_IN },
			p_erpusername: { val: erpusername, type: oracledb.STRING, dir: oracledb.BIND_IN },
			p_apiusername: { val: apiusername, type: oracledb.STRING, dir: oracledb.BIND_IN },
			p_active: { val: active, type: oracledb.STRING, dir: oracledb.BIND_IN },
			p_status: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
			p_message: { type: oracledb.STRING, dir: oracledb.BIND_OUT }
		};
		const result = await oracleClient.executeProcedure({
			procedure: `PKG_EMP_MASTER.PROC_UPDATE_EMP_MASTER(
				p_empno => :p_empno,
				p_empname => :p_empname,
				p_erpusername => :p_erpusername,
				p_apiusername => :p_apiusername,
				p_active => :p_active,
				p_status => :p_status,
				p_message => :p_message
			)`,
			binds,
			options: {}
		});
		res.json({
			statusCode: result.outBinds.p_status || 0,
			message: result.outBinds.p_message || 'OK'
		});
	} catch (err) {
		next(err);
	}
});

module.exports = router;
