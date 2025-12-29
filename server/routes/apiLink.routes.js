// routes/apiLink.routes.js
const express = require('express');
const router = express.Router();
const oracleClient = require('../oracleClient');


const oracledb = require('oracledb');

// GET /api/api-link/list
router.get('/list', async (req, res, next) => {
  try {
    const binds = {
      p_result: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
    };
    const result = await oracleClient.executeProcedure({
      procedure: 'PKG_API_LINK_MASTER.PROC_GET_API_LINK_LIST(p_result => :p_result)',
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

// POST /api/api-link/sync
router.post('/sync', async (req, res, next) => {
  try {
    await oracleClient.executeProcedure({
      procedure: 'PKG_API_LINK_MASTER.PROC_SYNC_EMP_API_LINK()',
      binds: {},
      options: {}
    });
    res.json({ statusCode: 0, message: 'Sync successful' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
