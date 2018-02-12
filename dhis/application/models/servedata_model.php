<?php
  defined('BASEPATH') OR exit('No direct script access allowed');

  class Servedata_model extends CI_Model {

      function __construct(){
        parent::__construct();
      }

      public function getData($tablename, $select, $join=null, $where, $orderby=null,$levelId){
        if($select){
            $this->db->select($select);
        }else{
          $this->db->select('*');
        }

        $this->db->from($tablename);

        if($join){
          $this->db->join($join[0], $join[1], $join[2]);
        }

        if($where){
            $this->db->where($where);
        }

        $this->db->where_in('data_level_id', $levelId);

        $this->db->limit(6);

        $query = $this->db->get();

        $rows = $query->result();
        if (isset($rows)){
          return $rows;
        }else{
          return false;
        }
      }

      public function saveToLocalDatabase ($array){
          $data = array(
            'data_indicator_id' => $array[0],
            'data_periodtype' => 'monthly',
            'data_period' => $array[1],
            'data_value' => $array[2],
            'data_lastupdated' => ''
          );

          $this->db->insert('datanational', $data);
      }
}
