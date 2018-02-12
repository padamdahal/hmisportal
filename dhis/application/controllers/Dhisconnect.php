<?php
	defined('BASEPATH') OR exit('No direct script access allowed');

	class Dhisconnect extends CI_Controller {

		public function index($level, $periodType){
			$this->load->model('dhisconnect_model');
			$this->load->library('nepali_calendar');

			$today = date("Y-m-d");
			$exp = explode('-',$today);
      $year = $exp[0];
      $month = $exp[1];
      $day = $exp[2];
			$npDateArray = $this->nepali_calendar->AD_to_BS($year, $month, $day);

			//exit(print_r($npDateArray));

			$indicators = $this->config->item('indicators');
			$dimension = 'dimension=dx:';

			foreach($indicators as $key => $indicator){
			  $dimension .= $key.';';
			}

			$dimension = rtrim($dimension,';');

			$period = '2071April';
			if($periodType == 'monthly'){
				// Decide which period to request data form
				//to do
				// Current month $npDateArray['month']
				$dimension .= '&dimension=pe:LAST_12_MONTHS';
			}elseif($periodType == 'fy'){
				$dimension .= '&filter=pe:'.$period;
			}else{
				exit('Not a valid period type, exiting...');
			}

			if($level == 'national'){
				$dimension .= '&dimension=ou:LEVEL-1;cCTQiGkKcTk&displayProperty=NAME&outputIdScheme=UID';
			}else if($level == 'province'){
				$dimension .= '&dimension=ou:LEVEL-2;cCTQiGkKcTk&displayProperty=NAME&outputIdScheme=UID';
			}else if($level == 'palika'){
				$dimension .= '&dimension=ou:LEVEL-4;cCTQiGkKcTk&displayProperty=NAME&outputIdScheme=UID';
			}else{
				exit('Not a valid level, exiting...');
			}

			$url = $this->config->item('dhis_url').$dimension;

			$dataArray = $this->dhisconnect_model->getDataFromDhis($this->config->item('dhis_username'), $this->config->item('dhis_password'), $url);
			$meta = $dataArray['metaData']['names'];
			$dataRows = $dataArray['rows'];

			foreach($dataRows as $row){
				// Check if data already exists
				$tablename = 'data';
				$select = '*';
				$where = array('data_indicator_id' => $row[0], 'data_level_id' => $row[1], 'data_period' => $period);
				$dataExists = $this->dhisconnect_model->dataExists($tablename, $select, $where);

				if($dataExists == false){
					//$this->dhisconnect_model->saveToLocalDatabase($indicator_id, $level, $level_id, $level_name, $periodType, $period, $value)
					$levelName = $meta[$row[1]];
					$this->dhisconnect_model->saveToLocalDatabase($row[0], $level, $row[1], $levelName, $periodType, $period, $row[2]);
					echo "Data inserted...\r\n";
				}else{
					echo "Data already exists, skipping...\r\n";
				}
			}
		}


		public function organisationUnits($ouId){
			$this->load->model('dhisconnect_model');
			$this->load->library('nepali_calendar');

			$apiUrl = "http://"."localhost:8000/hmis/api/analytics.json?dimension=dx:xSVY3vvt3me.EXPECTED_REPORTS&dimension=ou:LEVEL-4;";
			$apiUrl = $apiUrl . $ouId . '&filter=pe:LAST_MONTH&displayProperty=NAME&outputIdScheme=NAME';

			//$url = $this->config->item('dhis_url').$dimension;

			$ouJson = $this->dhisconnect_model->getDataFromDhis($this->config->item('dhis_username'), $this->config->item('dhis_password'), $apiUrl);
			
			$meta = $ouJson['metaData']['names'];
			$ouList = $ouJson['metaData']['ou'];

			foreach($ouList as $ou){
				// Check if data already exists
				$tablename = 'organisationunits';
				$select = '*';
				$where = array('organisationunit_id' => $ou);
				$dataExists = $this->dhisconnect_model->dataExists($tablename, $select, $where);

				if($dataExists == false){
					//$this->dhisconnect_model->saveToLocalDatabase($indicator_id, $level, $level_id, $level_name, $periodType, $period, $value)
					$ouName = $meta[$ou];
					$this->dhisconnect_model->saveOrganisationUnits($ou, $ouId, $ouName);
					echo "Data inserted...\r\n";
				}else{
					echo "Data already exists, skipping...\r\n";
				}
			}
		}
}
