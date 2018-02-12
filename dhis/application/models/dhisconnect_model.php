<?php
  defined('BASEPATH') OR exit('No direct script access allowed');

  class Dhisconnect_model extends CI_Model {

      function __construct(){
        parent::__construct();
      }

      public function getDataFromDhis($username, $password, $url){
        $ch = curl_init($url);
    		curl_setopt($ch, CURLOPT_RETURNTRANSFER,1);
    		curl_setopt($ch, CURLOPT_USERPWD, "$username:$password");
    		$result = curl_exec ($ch);

    		if(!curl_errno($ch)){
    			$status_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    		}

    		curl_close ($ch);

    		$data = json_decode($result, true);
        return $data;
      }

      public function saveToLocalDatabase ($indicator_id, $level, $level_id, $level_name, $periodType, $period, $value){
          $data = array(
            'data_indicator_id' => $indicator_id,
            'data_periodtype' => $periodType,
            'data_level' => $level,
            'data_level_id' => $level_id,
            'data_level_name' => $level_name,
            'data_period' => $period,
            'data_value' => $value,
            'data_lastupdated' => ''
          );

          $this->db->insert('data', $data);
      }

      public function saveOrganisationUnits ($organisationunit_id, $province_id, $organisationunit_name){
          $data = array(
            'organisationunit_id' => $organisationunit_id,
            'organisationunit_province_id' => $province_id,
            'organisationunit_name' => $organisationunit_name
          );

          $this->db->insert('organisationunits', $data);
      }

      public function dataExists($tablename, $select, $where){

        if($select){
            $this->db->select($select);
        }else{
          $this->db->select('*');
        }

        $this->db->from($tablename);

        if($where){
            $this->db->where($where);
        }

        $query = $this->db->get();
        //exit($this->db->last_query());
        $rows = $query->result();
        if (empty($rows)){
          return false;
        }else{
          return true;
        }
      }
  }
