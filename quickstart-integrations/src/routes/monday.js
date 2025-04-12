const router = require('express').Router();
const { authenticationMiddleware } = require('../middlewares/authentication');
const mondayController = require('../controllers/monday-controller');

router.post('/monday/execute_action', authenticationMiddleware, mondayController.executeAction);
router.post('/monday/run_item_multiplication', authenticationMiddleware, mondayController.runItemMultiplication);
router.post('/monday/get_remote_list_options', authenticationMiddleware, mondayController.getRemoteListOptions);
router.get('/monday/get_factor',  mondayController.getMultiplicationFactor);
router.post('/monday/save_factor', mondayController.saveMultiplicationFactor);
router.get('/monday/get_calc_history', mondayController.getCalculationHistory);

module.exports = router;
