<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Servedata extends CI_Controller {
	function __construct(){
		parent::__construct();
		$this->load->model('servedata_model');
	}

	public function index($indicator, $periodType, $period, $level){
		$levelId;
		if($level == null || $level == 'national'){;
			 $levelId = array('cCTQiGkKcTk');
		}else if($level=='province'){
			$levelId = array('RVc3XoVoNRf','a6W190BanBu','hi16ZuHEWaY','GvgqqErqwFP','Zx3boDXh1Q5','fvN7GZvNAOB','wtU6v09Kbe0');//$level;
		}else{
			$levelId = array($level);
		}

		if($periodType == null){
			 $periodType = 'fy';
		}

		if($period == 'na'){
				$where = array('dt.data_periodtype' => $periodType, 'dt.data_indicator_id' => $indicator);
		}else{
			$where = array('dt.data_periodtype' => $periodType, 'dt.data_indicator_id' => $indicator, 'dt.data_period' => $period);
		}

		$tablename = 'data dt';
		$select = 'dt.data_indicator_id as id, dt.data_level_name as level, dt.data_period as period, dt.data_value as value, in.indicator_name as name, in.indicator_program as program';
		$join = array('indicators in', 'in.indicator_id = dt.data_indicator_id', 'INNER');

		$result = $this->servedata_model->getData($tablename, $select, $join, $where, null, $levelId);
		print_r(json_encode($result));
	}
}
