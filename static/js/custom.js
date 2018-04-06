$("#selectObject").change(function(){

    var obj_name = $("#selectObject").val();
    var type_select = $("#selectType").val();
    prev_div = '#div_'+type_select+'_checkbox';
    $(prev_div).css({'display':'none'});

    reset_object()

    var proj_id = $('#selectProject').val();
    if (!proj_id){
        alert("Please select valid project !!")
        return null
    }

    var div_check = '';
    if (obj_name == 'Sequence'){
        $("#div_shot_task_checkbox").css({'display':'none'});
        $("#div_shot_asset_build_task_checkbox").css({'display':'none'});
        $("#div_Sequence_checkbox").css({'display':'block'});
        div_check = '#div_Sequence_checkbox';
        create_table(div_check);
        load_obj_name(obj_name,'');
    }else if (obj_name == 'Asset Build'){
        $("#div_shot_task_checkbox").css({'display':'none'});
        $("#div_Sequence_checkbox").css({'display':'none'});
        $("#div_shot_asset_build_task_checkbox").css({'display':'none'});
	$select_elem = $("#selectType");
        load_types($select_elem)
    }else if (obj_name == 'Shot'){
        $("#div_Sequence_checkbox").css({'display':'none'});
        $("#div_shot_task_checkbox").css({'display':'block'});
        $("#div_shot_asset_build_task_checkbox").css({'display':'none'});
	div_check = '#div_shot_task_checkbox';
        create_table(div_check);
        load_obj_name('Sequence','');
    }else if (obj_name == 'Shot Asset Build'){
        $("#div_shot_task_checkbox").css({'display':'none'});
        $("#div_Sequence_checkbox").css({'display':'none'});
        $("#div_shot_asset_build_task_checkbox").css({'display':'block'});
	div_check = '#div_shot_asset_build_task_checkbox';
        create_table(div_check);
        load_obj_name('Sequence','');
    }else{
        return null
    }

});

$("#selectFtpObject").change(function(){

    var proj_id = $('#selectProject').val();
    if (!proj_id){
        alert("Please select valid project !!")
        return null
    }

    reset_ftp_object()

    var obj_name = $("#selectFtpObject").val();
    if (obj_name == 'Shot'){
        load_obj_name('FtpSequence','');
	$("#div_shot_department_name").css({'display':'block'});
	$("#div_asset_department_name").css({'display':'none'});
	$("#selectShotFtpDepartment_chosen").css({"width":"89%"});
	$('#selectShotFtpDepartment').val('').trigger("liszt:updated").trigger("chosen:updated");
    } else if (obj_name == 'Sequence'){
        load_obj_name('FtpSequence','');
	$("#div_sequence_department_name").css({'display':'block'});
	$("#div_shot_department_name").css({'display':'none'});
	$("#div_asset_department_name").css({'display':'none'});
	$("#selectSequenceFtpDepartment_chosen").css({"width":"89%"});
	$('#selectSequenceFtpDepartment').val('').trigger("liszt:updated").trigger("chosen:updated");
    }else if (obj_name == 'Asset Build'){
	$select_elem = $("#selectFtpType");
        load_types($select_elem);
	$("#div_asset_department_name").css({'display':'block'});
	$("#div_shot_department_name").css({'display':'none'});
	$("#selectAssetFtpDepartment_chosen").css({"width":"89%"});
	$('#selectAssetFtpDepartment').val('').trigger("liszt:updated").trigger("chosen:updated");
    }else{
	$("#div_shot_department_name").css({'display':'none'});
	$("#div_asset_department_name").css({'display':'none'});
	$("#div_sequence_department_name").css({'display':'none'});
        return null
    }

});

$("#selectClientObject").change(function(){

    var proj_id = $('#selectProject').val();
    if (!proj_id){
        alert("Please select valid project !!")
        return null
    }

    reset_client_object()

    var obj_name = $("#selectClientObject").val();
    if (obj_name == 'Sequence'){
        load_obj_name('ClientSequence','');
    }else if (obj_name == 'Asset Build'){
	$select_elem = $("#selectClientType");
        load_types($select_elem)
    }else{
        return null
    }

});

// Asset build type
(function () {
    var previous;

    $("#selectType").focus(function () {
        previous = this.value;
    }).change(function() {
    remove_rows("#tbl_task");
    $('#all_assets').attr('checked',false);
    var obj_name = $("#selectObject").val();
    if (!obj_name){
        alert("Please select valid Object !!")
        return null
    }

    var select_type = $("#selectType").val();

    div_check = '#div_'+select_type+'_checkbox';
    prev_div = '#div_'+previous+'_checkbox';
    $(prev_div).css({'display':'none'});
    $(div_check).css({'display':'block'});
    create_table(div_check);

    if (select_type){
        load_obj_name(obj_name,'');
    }else{
        $("#selectAsset").empty();
        $("#selectAsset").trigger("chosen:updated");
        $("#selectAsset").trigger("liszt:updated");
        $("#div_asset_name").css({'display':'none'});
    }
    previous = this.value;
    });
})();

$("#selectFtpType").change(function(){
    select_type = $("#selectFtpType").val();
    if (!select_type){
	alert("Please select valid asset type !!!");
	return null;
    }
    load_obj_name('FtpAsset','');
});

$("#selectClientType").change(function(){
    select_type = $("#selectClientType").val();
    if (!select_type){
	alert("Please select valid asset type !!!");
	return null;
    }
    load_obj_name('ClientAsset','');
});

// Asset Build
$("#selectAsset").on('change', function(evt, params) {

    var proj_id = $('#selectProject').val();
    if (!proj_id){
        alert("Please select valid project !!");
        return null;
    }
    var deselectedValue = params.deselected;
    var selectedValue = params.selected;

    object = $('#selectObject').val();

    if (selectedValue){
        var array = [];
        array[0] = selectedValue
	id = selectedValue
        p_name = $("#selectAsset option[value='"+id+"']").text();
        load_tasks(array,'',p_name,0,object);
    }else if (deselectedValue){
        var asset_name = $("#selectAsset option[value='"+deselectedValue+"']").text();
        $("#tbl_task tr:contains("+ asset_name +")").remove();
    }
});

$("#all_assets").click(function(){
    if (this.checked){
        $('#selectAsset option').prop('selected', true);
	$('#selectAsset').trigger('chosen:updated');
	reload_tasks();
    }else{
        $('#selectAsset option').prop('selected', false);
	$('#selectAsset').trigger('chosen:updated');
	remove_rows("#tbl_task");
    }
});

$('#selectFtpAsset').on('change', function(evt, params) {

    $('#selectFtpAssetType').val('').trigger("liszt:updated").trigger("chosen:updated");
    var proj_id = $('#selectProject').val();
    if (!proj_id){
        alert("Please select valid project !!");
        return null;
    }
    var deselectedValue = params.deselected;
    var selectedValue = params.selected;

    if (selectedValue){
	load_ftp_asset_type(selectedValue);
    }

    if (deselectedValue){
        var asset_name = $("#selectFtpAsset option[value='"+deselectedValue+"']").text();
        $("#tbl_ftp_version tr:contains("+ asset_name +")").remove();
    }
});

$("#all_ftp_assets").click(function(){
    if (this.checked){
        $('#selectFtpAsset option').prop('selected', true);
    }else{
        $('#selectFtpAsset option').prop('selected', false);
    }
    $('#selectFtpAsset').trigger('chosen:updated');

    assets = $('#selectFtpAsset').val();
    if (assets){
	parent_id = assets[0];
	load_ftp_asset_type(parent_id);
    }else{
	alert("Please select atleast 1 asset build !!!");
	return null;
    }
});
$('#selectFtpAssetType').on('change', function(evt, params) {
    var selectedValue = params.selected;

    $('#selectFtpAssetName').val('').trigger("liszt:updated").trigger("chosen:updated");

    obj = $('#selectFtpObject').val();
    parent_id = ''
    values = ''
    if (obj == 'Shot'){
	values = $('#selectFtpShot').val();
    }else if (obj == 'Asset Build'){
	values = $('#selectFtpAsset').val();
    }

    if (values){
	parent_id = values[0];
    }else{
	alert("Please select "+obj);
	return null;
    }

    load_ftp_asset_name(parent_id);

});

$('#selectAssetFtpDepartment').change(function(){
    if ($(this).val() == 'Lighting'){
	$('#div_side_name').css({'display':'block'});
	$("#selectFtpVersionSide_chosen").css({"width":"89%"})
    }else{
	$('#div_side_name').css({'display':'none'});
    }

    $('#selectFtpVersionSide').val('').trigger("liszt:updated").trigger("chosen:updated");
    refresh_asset_builds();
});

$('#refresh_asset_build').click(function(){

    refresh_asset_builds();
//    setTimeout(5000);
//    alert("Prafull");
});

$('#selectClientAsset').on('change', function(evt, params) {

    var selectedValue = params.selected;

    if (selectedValue){
	name = $('#selectClientAsset option[value="'+selectedValue+'"]').text();
	load_client_version(name);
    }

});

// sequence box
$('#selectSequence').on('change', function(evt, params) {

//    remove_rows("#tbl_task");
    $('#all_shots').attr('checked',false);
    var obj_name = $("#selectObject").val();
    if (!obj_name){
        alert("Please select valid Object !!")
        return null
    }
    var deselectedValue = params.deselected;
    var selectedValue = params.selected;

    if (selectedValue && obj_name == 'Shot'){
        var obj_name = 'Shot';
        load_obj_name(obj_name,selectedValue);
    }else if (selectedValue && obj_name == 'Shot Asset Build'){
        var obj_name = 'Shot';
        load_obj_name(obj_name,selectedValue);
    }else if (selectedValue){
        var array = [];
        array[0] = selectedValue
	id = selectedValue
        p_name = $("#selectSequence option[value='"+id+"']").text();
        load_tasks(array,'',p_name,0,obj_name);
    }else if (deselectedValue){
        de_seq = $("#selectSequence option[value='"+deselectedValue+"']").text();
        $("#selectShot option:contains('"+de_seq+"')").remove();
        $("#selectShot").trigger("chosen:updated");
        $("#selectShot").trigger("liszt:updated");
        $("#tbl_task tr:contains("+ de_seq +")").remove();
    }
});

$("#all_sequences").click(function(){
    if (this.checked){
        $('#selectSequence option').prop('selected', true);
	$('#selectSequence').trigger('chosen:updated');
	reload_tasks();
    }else{
        $('#selectSequence option').prop('selected', false);
	$('#selectSequence').trigger('chosen:updated');
	remove_rows("#tbl_task");
    }

});
$('#selectFtpSequence').on('change', function(evt, params) {

    var task_name = $("#selectShotFtpDepartment").val();
    if (!task_name){
        alert("Please select valid Department !!")
        return null
    }

    var deselectedValue = params.deselected;
    var selectedValue = params.selected;

    if (selectedValue){
        var obj_name = 'FtpShot';
        load_obj_name(obj_name,selectedValue);
    }else if (deselectedValue){
        de_seq = $("#selectFtpSequence option[value='"+deselectedValue+"']").text();
        $("#selectFtpShot option:contains('"+de_seq+"')").remove();
        $("#selectFtpShot").trigger("chosen:updated");
        $("#selectFtpShot").trigger("liszt:updated");
        $("#tbl_ftp_version tr:contains("+ de_seq +")").remove();
    }
});

$('#selectClientSequence').on('change', function(evt, params) {

    var seq_id = $("#selectClientSequence").val();
    if (!seq_id){
        alert("Please select valid Sequence !!")
        return null
    }

    if (seq_id){
        var obj_name = 'ClientShot';
        load_obj_name(obj_name,seq_id);
    }
});

// Shot
$('#selectShot').on('change', function(evt, params) {
    var proj_id = $('#selectProject').val();
    if (!proj_id){
        alert("Please select valid project !!");
        return null;
    }
    var deselectedValue = params.deselected;
    var selectedValue = params.selected;

    object = $('#selectObject').val();

    if (selectedValue){
        var array = [];
        array[0] = selectedValue
	id = selectedValue
        p_name = $("#selectShot option[value='"+id+"']").text();
        load_tasks(array,'',p_name,0,object);
    }else if (deselectedValue){
        var shot_name = $("#selectShot option[value='"+deselectedValue+"']").text();
        $("#tbl_task tr:contains("+ shot_name +")").remove();
    }
});

$("#all_shots").click(function(){
    if (this.checked){
        $('#selectShot option').prop('selected', true);
	$('#selectShot').trigger('chosen:updated');
	reload_tasks();
    }else{
        $('#selectShot option').prop('selected', false);
	$('#selectShot').trigger('chosen:updated');
	remove_rows("#tbl_task");
    }

});

$('#selectFtpShot').on('change', function(evt, params) {

    $('#selectFtpAssetType').val('').trigger("liszt:updated").trigger("chosen:updated");
    var proj_id = $('#selectProject').val();
    if (!proj_id){
        alert("Please select valid project !!");
        return null;
    }
    var deselectedValue = params.deselected;
    var selectedValue = params.selected;

    if (selectedValue){
	load_ftp_asset_type(selectedValue);
    }

    if (deselectedValue){
        var shot_name = $("#selectFtpShot option[value='"+deselectedValue+"']").text();
        $("#tbl_ftp_version tr:contains("+ shot_name +")").remove();
    }
});

$("#all_ftp_shots").click(function(){
    if (this.checked){
        $('#selectFtpShot option').prop('selected', true);
    }else{
        $('#selectFtpShot option').prop('selected', false);
    }
    $('#selectFtpShot').trigger('chosen:updated');

    shots = $('#selectFtpShot').val();
    if (shots){
	parent_id = shots[0];
	load_ftp_asset_type(parent_id);
    }else{
	alert("Please select atleast 1 shot !!!");
	return null;
    }

});

$('#selectShotFtpDepartment').change(function(){
    if ($(this).val() == 'Lighting'){
	$('#div_side_name').css({'display':'block'});
	$("#selectFtpVersionSide_chosen").css({"width":"89%"})
    }else{
	$('#div_side_name').css({'display':'none'});
    }

    $('#selectFtpVersionSide').val('').trigger("liszt:updated").trigger("chosen:updated");
    refresh_shots();
});

$('#refresh_shot').click(function(){

    refresh_shots();
//    setTimeout(5000);
//    alert("Prafull");
});

$('#selectClientShot').on('change', function(evt, params) {

    var selectedValue = params.selected;

    if (selectedValue){
	name = $('#selectClientShot option[value="'+selectedValue+'"]').text();
	load_client_version(name);
    }

});
// functions starts here
(function () {
    var toggle_selection1=0;
    var toggle_selection2=0;
//Menu Navigator
$('a.toggle_right').click(function () {
    if(toggle_selection2==1){
        $("#panel_big").css({"width":"83%"});}
    else{
    $("#panel_big").css({"width":"91%"});}
        $("#toggle_right").css({"display":"none"});
        $("#toggle_left").css({"display":"block"});
    $("#task_menu1").css({"display":"block"});
    toggle_selection1=1;
    });
$('a.toggle_left').click(function () {
    if(toggle_selection2==1){
        $("#panel_big").css({"width":"91%"});}
    else{
        $("#panel_big").css({"width":"99.50%"});}
        $("#toggle_left").css({"display":"none"});
        $("#toggle_right").css({"display":"block"});
    $("#task_menu1").css({"display":"none"});
    toggle_selection1=0;
    });

// Task status navigator
$('a.toggle_task_right').click(function () {
    if(toggle_selection1==1){
        $("#panel_big").css({"width":"91%"});}
    else{
        $("#panel_big").css({"width":"99.50%"});}
        $("#toggle_task_right").css({"display":"none"});
        $("#toggle_task_left").css({"display":"block"});
        $("#task_menu").css({"display":"none"});
    toggle_selection2=0;
    });
$('a.toggle_task_left').click(function () {
    if(toggle_selection1==1){
        $("#panel_big").css({"width":"83%"});}
    else{
    $("#panel_big").css({"width":"91%"});}
        $("#toggle_task_left").css({"display":"none"});
        $("#toggle_task_right").css({"display":"block"});
        $("#task_menu").css({"display":"block"});
    toggle_selection2=1;
    });


})();

function remove_rows(tablename) {
    $(tablename).find("tbody tr").remove();
}

function reset_object(){

    $('#all_assets').attr('checked',false);
    $('#all_shots').attr('checked',false);
    $('#all_sequences').attr('checked',false);

    $("#selectSequence").empty();
    $("#selectSequence").trigger("chosen:updated");
    $("#selectSequence").trigger("liszt:updated");
    $("#div_sequence_name").css({'display':'none'});

    $("#selectType").empty();
    $("#selectType").trigger("chosen:updated");
    $("#selectType").trigger("liszt:updated");
    $("#div_type_name").css({'display':'none'});

    $("#selectShot").empty();
    $("#selectShot").trigger("chosen:updated");
    $("#selectShot").trigger("liszt:updated");
    $("#div_shot_name").css({'display':'none'});

    $("#selectAsset").empty();
    $("#selectAsset").trigger("chosen:updated");
    $("#selectAsset").trigger("liszt:updated");
    $("#div_asset_name").css({'display':'none'});

    remove_rows('#tbl_task');
}

function reset_ftp_object(){

    $('#all_assets').attr('checked',false);
    $('#all_shots').attr('checked',false);

    $("#selectFtpSequence").empty();
    $("#selectFtpSequence").trigger("chosen:updated");
    $("#selectFtpSequence").trigger("liszt:updated");
    $("#div_sequence_name").css({'display':'none'});

    $("#selectFtpType").empty();
    $("#selectFtpType").trigger("chosen:updated");
    $("#selectFtpType").trigger("liszt:updated");
    $("#div_type_name").css({'display':'none'});

    $("#selectFtpShot").empty();
    $("#selectFtpShot").trigger("chosen:updated");
    $("#selectFtpShot").trigger("liszt:updated");
    $("#div_shot_name").css({'display':'none'});

/*
    $("#selectFtpAsset").empty();
    $("#selectFtpAsset").trigger("chosen:updated");
    $("#selectFtpAsset").trigger("liszt:updated");
    $("#div_asset_name").css({'display':'none'});
*/

    remove_rows('#tbl_task');
}
function reset_client_object(){

    $("#selectClientSequence").empty();
    $("#selectClientSequence").trigger("chosen:updated");
    $("#selectClientSequence").trigger("liszt:updated");
    $("#div_sequence_name").css({'display':'none'});

    $("#selectClientType").empty();
    $("#selectClientType").trigger("chosen:updated");
    $("#selectClientType").trigger("liszt:updated");
    $("#div_type_name").css({'display':'none'});

    $("#selectClientShot").empty();
    $("#selectClientShot").trigger("chosen:updated");
    $("#selectClientShot").trigger("liszt:updated");
    $("#div_shot_name").css({'display':'none'});

    $("#selectClientAsset").empty();
    $("#selectClientAsset").trigger("chosen:updated");
    $("#selectClientAsset").trigger("liszt:updated");
    $("#div_asset_name").css({'display':'none'});

    $("#selectClientVersion").empty();
    $("#selectClientVersion").trigger("chosen:updated");
    $("#selectClientVersion").trigger("liszt:updated");

}
function load_types($select_elem){
    $select_elem.empty();
    $("#div_type_name").css({'display':'block'});

    $select_elem.append('<option value="">Select Type</option>');
    $select_elem.append('<option value="Set">Set</option>');
    $select_elem.append('<option value="FX">FX</option>');
    $select_elem.append('<option value="Prop">Prop</option>');
    $select_elem.append('<option value="Character">Character</option>');
    $select_elem.append('<option value="Vehicle">Vehicle</option>');
    $select_elem.append('<option value="Environment">Environment</option>');

    $select_elem.trigger("chosen:updated");
    $select_elem.trigger("liszt:updated");
    $select_elem.data("chosen").destroy().chosen();
}

function load_obj_name(obj_name,parent_id,no_project_flag) {
    no_project_flag = no_project_flag || 0;
   
    if (!no_project_flag){
	var project = $('#selectProject').val();
	if (!project){
	    alert("Please select valid project !!")
	    return null
	}
    }
    var client_final_combo = $("#selectFtpAssetName").val();
    var select_type = ''
    var $div_name = ''
    var $select_elem = ''
    var task_name = ''
    var status_name = ''

    if (obj_name == 'Sequence'){
        $select_elem = $("#selectSequence");
        $div_name = $("#div_sequence_name")
    }else if (obj_name == 'Asset Build'){
        $select_elem = $("#selectAsset");
        $div_name = $("#div_asset_name")
        select_type = $("#selectType").val();
    }else if (obj_name == 'Shot'){
        $select_elem = $("#selectShot");
        $div_name = $("#div_shot_name")
    }else if (obj_name == 'FtpSequence'){
        $select_elem = $("#selectFtpSequence");
        $div_name = $("#div_sequence_name");
	obj_name = 'Sequence';
    }else if (obj_name == 'FtpShot'){
        $select_elem = $("#selectFtpShot");
        $div_name = $("#div_shot_name");
	task_name = $("#selectShotFtpDepartment").val();
	status_name = $("#selectFtpStatus").val();
    }else if (obj_name == 'FtpAsset'){
        $select_elem = $("#selectFtpAsset");
        $div_name = $("#div_asset_build_name");
	task_name = $("#selectAssetFtpDepartment").val();
	status_name = $("#selectFtpStatus").val();
        select_type = $("#selectFtpType").val();
    }else if (obj_name == 'ClientSequence'){
        $select_elem = $("#selectClientSequence");
        $div_name = $("#div_sequence_name");
	obj_name = 'Sequence';
    }else if (obj_name == 'ClientShot'){
        $select_elem = $("#selectClientShot");
        $div_name = $("#div_shot_name");
	obj_name = 'Shot';
    }else if (obj_name == 'ClientAsset'){
        $select_elem = $("#selectClientAsset");
        $div_name = $("#div_asset_name");
        select_type = $("#selectClientType").val();
	obj_name = 'Asset Build';
    }else if (obj_name == 'RejectAsset'){
        $select_elem = $("#selectVersionAssetBuild");
        $div_name = $("#div_asset_name");
        select_type = $("#selectVersionAssetType").val();
	project = parent_id;
	parent_id = 0;
	obj_name = 'Asset Build';
    }else{
        return null
    }
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'proj_id': project ,'object_name': obj_name , 'object_type' : select_type, 'parent_id' : parent_id, 'task_name': task_name, 'status_name': status_name, 'upload_for':client_final_combo},
        beforeSend: function(){
            if (!(parent_id)){
                $select_elem.empty();
            }
        },
        success: function(json){
            $div_name.css({'display':'block'});
            $.each(json, function (idx, obj) {
		opt_text = ''
		opt_id = obj.id
                if(parent_id){
		    opt_text = obj.parent_name+'_'+obj.name
                }else{
		    opt_text = obj.name
                }

		$select_elem.append('<option value="'+opt_id+'">' + opt_text + '</option>');
            });
            $select_elem.trigger("chosen:updated");
            $select_elem.trigger("liszt:updated");
            $select_elem.data("chosen").destroy().chosen({search_contains:true});
        },
        error: function(error){
            console.log("Error:");
            console.log(error);
        }
    });
}
function load_choosen_data($div_name,$select_elem,obj_name,parent_id) {

    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'object_name': obj_name , 'parent_id' : parent_id},
        beforeSend: function(){
            $select_elem.empty();
	    $select_elem.append('<option value="">'+obj_name+'</option>');
        },
        success: function(json){
            $div_name.css({'display':'block'});
            $.each(json, function (idx, obj) {
		opt_id = obj.id
		opt_text = obj.name
		opt_path = obj.path
		$select_elem.append('<option value="'+opt_id+'" data-path="'+opt_path+'">' + opt_text + '</option>');
            });
            $select_elem.trigger("chosen:updated");
            $select_elem.trigger("liszt:updated");
//            $select_elem.data("chosen").destroy().chosen({search_contains:true});
        },
        error: function(error){
            console.log("Error:");
            console.log(error);
        }
    });
}
/*
function load_task(proj_id,parent_id,parent_name) {
    var mycol = [];
    var mycolusers = [];
    var task_id = [];
    var task_parent_ids = [];
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'proj_id': proj_id ,'object_name': 'Task', 'parent_id': parent_id },
        beforeSend: function(){
        },
        success: function(json){
            $("#div_task_details").css({'display':'block'});
            $.each(json, function (idx, obj) {
                $('#tbl_task th').each(function(index) {
                    var task_name = this.innerHTML;
                    if (obj.name == task_name){
                        task_id[index] = obj.id;
                        mycol[index] = obj.status;
                        mycolusers[index] = obj.users;
                        task_parent_ids[index] = obj.parent_id;
                    }
                });
            });
            mycol[0] = parent_name;
            add_rows(mycol,parent_id,mycolusers,task_id,task_parent_ids);
        },
        error: function(error){
            console.log("Error:");
            console.log(error);
        }
    });
}
*/
function add_rows(mycol,parent_id,mycolusers,task_id,task_parent_ids){

    var obj_name = $("#selectObject").val();
    var table = $('#tbl_task tbody');
    row = $(table[0].insertRow(-1));
    $('#tbl_task th').each(function(index) {
        var th_name = $(this).text();
        var t_status = '---';
        var stat_lbl = 'label-default';
        var t_stat_user = '---';
        var stat_usr_lbl = 'label-default';
        var taskid = ''
	if (task_parent_ids[index]){
	    parent_id = task_parent_ids[index];
	}
        if(mycol[index]){
            t_status = mycol[index];
            label = mycol[index].replace(/ /g,"_").toLowerCase();
            stat_lbl = 'label-'+label;
        }

        if(mycolusers[index]){
            t_stat_user = mycolusers[index];
            stat_usr_lbl = 'label-default';
        }

        if(task_id[index]){
            taskid = task_id[index];
        }

        on_click_status = "";
        on_click_user = "";
        if (index > 0){
            if($(this).css('display') == 'none'){
                show = "style='display:none'";
            }else{
                show = "";
                var header = this.innerHTML;
                col_arr = $('#user_columns').val().split(',');
                if (col_arr.indexOf(header) > -1){
                    on_click_status = "ondblclick='editCell(this)'";
                    on_click_user = "ondblclick='editUserCell(this)'";
                }
            }

            var stat_display = ''
            var assi_display = ''
            if(show == ''){
                if($('#show_assignee').is(":not(:checked)")){
                    assi_display = 'style="display:none"';
                }
                if($('#show_status').is(":not(:checked)")){
                    stat_display = 'style="display:none"';
                }
            }

            var cell = $("<td title='"+th_name+"' data-task-id='"+taskid+"' data-org-val='"+t_status+"' data-parent-id='"+parent_id+"' data-id='show_status' "+show+" "+stat_display+" "+on_click_status+" />");
/*
            if(t_status == '---'){
                cell = $("<td title='"+th_name+"' data-task-id='"+taskid+"' data-org-val='"+t_status+"' data-id='show_status' "+show+" "+stat_display+" />");
            }
*/
            col_data = '<span class="label '+stat_lbl+'" >'+t_status+'</span>';

            var usercell = $("<td title='"+th_name+"' data-task-id='"+taskid+"' data-org-val='"+t_stat_user+"' data-parent-id='"+parent_id+"' data-id='show_assignee' "+show+" "+assi_display+" "+on_click_user+" />");
            usercol_data = '<span class="label '+stat_usr_lbl+'" >'+t_stat_user+'</span>';
        }else{

	    if (mycol[0] != t_status){
		t_status = t_status+'_'+mycol[0];
	    }
            var cell = $("<td id='"+parent_id+"' data-task-id='"+parent_id+"' data-task-parent-id='"+parent_id+"'/>");
            col_data = '<a href="#" id="parent_object" onclick="show_model(this)">'+t_status+'</a>';

            var usercell = '';
            usercol_data = '';
        }


        cell.html(col_data);
	if (usercell != ''){
	    usercell.html(usercol_data);
	}

        th_id = $(this).attr("class");
        if ($('#' + th_id).is(":not(:checked)")){
            cell.css({'display':'none'});
        }
        row.append(cell,usercell);
    });

    $(row).click(function(event){
        if(event.ctrlKey === true) {
            $(this).toggleClass("selected")
        }
    });
}
function create_table(div_check) {

    var table = $('<table class="table-hover table-condensed table-bordered" id="tbl_task" />');

    thead = $('<thead />');
    tbody = $('<tbody />');

    var row = $(thead[0].insertRow(-1));

//    var headerCell = $('<th />');
    var headerCell = $('<th name="Name" onclick="sortOrder(this)" title="Double Click to sort"/>');
//    var headerCell = $('<th name="Name" onclick="sortOrder(this)" colspan="2" title="Double Click to sort"/>');
    var header = 'Name';

    headerCell.html('<i class="glyphicon glyphicon-sort-by-alphabet"></i>&nbsp;'+header);
    row.append(headerCell);

    col_val = $('#user_columns').val();
    col_arr = col_val.split(',');

    $(div_check+' input[type="checkbox"]').each(function() {
        if($.contains(document, this)){
            var header = this.value;
            if (col_arr.indexOf(header) > -1){
                this.checked = true;
                show = "";
            }else{
                this.checked = false;
                show = "style='display:none'";
            }

            var class_id = $(this).attr('id');
            var headerCell = $('<th name="'+header+'" class="'+class_id+'" '+show+' colspan="2"/>');

            headerCell.html(header);
            row.append(headerCell);
        }
    });

    table.append(thead);
    table.append(tbody);

    var dvTable = $("#div_task_details");
    dvTable.html("");
    dvTable.append(table);

    $(div_check+' input[type="checkbox"]').click(function() {
        var index = $(this).attr('id').match(/\d+/)[0];
        var index2 = index--;
        $('#tbl_task tr').each(function() {
            if($('#show_assignee').is(":checked")){
                $('td:eq(' + index2 + ')',this).toggle();
            }
            if($('#show_status').is(":checked")){
                $('td:eq(' + index + ')',this).toggle();
            }
        });
        if($('#show_assignee').is(":checked") && $('#show_status').is(":checked")){
            $('th.' + $(this).attr('id')).attr('colspan','2');
        }else{
            $('th.' + $(this).attr('id')).attr('colspan','1');
        }
        $('th.' + $(this).attr('id')).toggle();

        //if($('#show_status_count').is(':checked')){

            var value = $(this).attr('value');
            var truth = $('th').find(value).index();
            var truth = $('th[name^="'+value+'"]').index();//$('th:contains("'+(value)+'"$)').index();
            truth = truth + 1;
            //alert(truth + "\t ---" + value);
            var checked = this.checked;

            $("#new_table tr").each(function(){
                if($('#new_table th[name="' + value + '"]').css('display') == 'none'){
                    //alert("if style none");
                    if(checked){
                        //alert("checkbox checked");
                        $('#new_table th[name="' + value + '"]').css('display', 'table-cell');
                        $('.show_hide:nth-child('+truth+')').css('display','table-cell');
                        //$('.hide_show').css('display', 'table-cell');
                    }
                    else{
                        //alert(truth + "\t in else ---" + value);
                        $('#new_table th[name="' + value + '"]').css('display', 'none');
                        $('.show_hide:nth-child('+truth+')').css('display','none');
                    }
                    return false;
                }
                else{
                        //alert("in main else" + "\t" + truth);
                        $('#new_table th[name="' + value + '"]').css('display', 'none');
                        $('.show_hide:nth-child('+truth+')').css('display','none');
                }
                return false;
            });
        //}
    });

    create_new_table_status_count(div_check);
}

$('#div_elements_checkbox input[type="checkbox"]').each(function() {
    this.checked = true;
});

$('#div_elements_checkbox input[type="checkbox"]').click(function() {
    var id = $(this).attr('id');
    var checked = this.checked;
    $('#tbl_task td').each(function() {
        td_idx = $(this).index();
        var td_id = $(this).attr('data-id');
        var title = $(this).attr('title');
        if (td_id == id){
            if ($('#tbl_task th[name="'+title+'"]').css('display') != 'none'){
                if (checked){
                    if((id=='show_status' && $('#show_assignee').is(":checked")) || (id=='show_assignee' && $('#show_status').is(":checked"))){
                        $('#tbl_task th[name="'+title+'"]').attr('colspan','2');
                    }
                    $(this).show();
                }else{
                    $('#tbl_task th[name="'+title+'"]').attr('colspan','1');
                    $(this).hide();
                }
            }
        }
    });
});

function reload_tasks(reload){

    reload = reload || 0;

    var proj_id = $('#selectProject').val();
    var asset_ids = $('#selectAsset').val();
    var shot_ids = $('#selectShot').val();
    var seq_ids = $('#selectSequence').val();
    var type_name = $('#selectType').val();
    var obj_name = $('#selectObject').val();

    remove_rows("#tbl_task");
    var parent_name  = ''
    var parent_ids = ''
    var p_name = ''
    var parent_object_type = '';
    if (asset_ids){
        pparent_ids = [proj_id]
	parent_ids = asset_ids
	id = parent_ids[0]
	p_name = $("#selectAsset option[value='"+id+"']").text();
	parent_object_name = 'Asset Build';
	parent_object_type = type_name;
    }else if(shot_ids){
        pparent_ids = seq_ids;
	parent_ids = shot_ids;
	id = parent_ids[0]
	p_name = $("#selectShot option[value='"+id+"']").text();
	parent_object_name = 'Shot';
	if (obj_name == 'Shot Asset Build'){
	    for (i in shot_ids){
		id = shot_ids[i];
		object = 'Shot Asset Build';
		p_name = $("#selectShot option[value='"+id+"']").text();
		var array = [];
		array[0] = id;
		load_tasks(array,'',p_name,0,object);
	    }
	    return null;
	}
    }else if(seq_ids){
        pparent_ids = [proj_id]
	parent_ids = seq_ids;
	id = parent_ids[0]
	p_name = $("#selectSequence option[value='"+id+"']").text();
	parent_object_name = 'Sequence';
    }
    if (parent_ids.length == 1) {
	parent_name = p_name
    }
    load_tasks(parent_ids,pparent_ids,parent_name,reload,parent_object_name,parent_object_type);

}

function load_tasks(parent_ids,pparent_ids,parent_name,reload,parent_object_name,parent_object_type) {
    var task;
    parent_name = parent_name || '';
    reload = reload || 0;
    parent_object_name = parent_object_name || '';
    parent_object_type = parent_object_type || '';

    if (parent_ids.length == 1 || reload == 1){
        task = 'Task';
    }else{
        task = 'Tasks';
    }

    data_ids = JSON.stringify(parent_ids);
    pparent_ids = JSON.stringify(pparent_ids);
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'parent_ids': data_ids ,'object_name': task, 'pparent_ids' : pparent_ids , 'parent_object_name': parent_object_name, 'parent_object_type': parent_object_type},
        beforeSend: function(){
            $('#panel_big').plainOverlay('show');
        },
        success: function(json){
            $("#div_task_details").css({'display':'block'});
            for (parent_id in json){
                var mycol = [];
                var mycolusers = [];
                var task_id = [];
                var task_parent_ids = [];
		var parent_type = ''
                $.each(json[parent_id], function (idx, obj) {
		    if (!mycol[0]){
			mycol[0] = obj.parent_name;
			parent_type = obj.parent_type;
		    }
                    $('#tbl_task th').each(function(index) {
                        var task_name = this.innerHTML;
                        if (obj.name == task_name){
                            task_id[index] = obj.id;
                            mycol[index] = obj.status;
                            mycolusers[index] = obj.users;
                            task_parent_ids[index] = obj.parent_id;
                        }
                    });
                });
	    if (parent_name && parent_name != mycol[0]){
		mycol[0] = parent_name + ' <br>' + mycol[0] + ' <br><small style="color:aqua">(' + parent_type + ')<small>';
	    }
            add_rows(mycol,parent_id,mycolusers,task_id,task_parent_ids);
            }

	    show_graphs();
	    var status_hash = get_status_hash();
	    show_status_count(status_hash);
	    show_display();

            $('#panel_big').plainOverlay('hide');
        },
        error: function(error){
            console.log("Error:");
            console.log(error);
        }
    });
}

$('#displayOptions').change(function(){
    show_display();
});

function show_display(){
    var select_val = $('#displayOptions').val();
    $('#div_task_details').css({'display':'none'});
    $('#task_status_chart').css({'display':'none'});
    $('#div_status_count_details').css({'display':'none'});
    if(select_val == "Status"){
	$('#div_task_details').css({'display':'block'});
	$('#dwn_task_status').attr("onclick","$('#tbl_task').table2excel({filename: 'task_status',exclude: '.noExl'});");
    }
    else if(select_val == "Chart"){
	$('#task_status_chart').css({'display':'block'});
    }
    else if(select_val == "Status Count"){
        $('#div_status_count_details').css({'display':'block'});
	$('#dwn_task_status').attr("onclick","$('#new_table').table2excel({filename: 'task_status_count',exclude: '.noExl'});");
    }else{
	$('#div_task_details').css({'display':'block'});
    }
}


$('#dwn_task_count_status').click(function(){

$('#status_count_table').table2excel({
    exclude: ".noExl",
    filename: "task_status_details"

});

});

/*
    this function display data
    according with status
*/
function show_status_count(status_count_hash){

    remove_rows("#new_table");

    $.each(status_count_hash, function(status_key, status_value){
	var status_row = "<td><strong>" + status_key + "</strong></td>";
	var row = $("<tr>");

	if (status_key == 'Total')
	    row = $('<tr style="background-color: black;">');

        $('#new_table th').each(function() {
            th_name = $(this).attr('name');
            th_style = $(this).attr('style');

            if(th_name != 'Status'){
                var th_name_total = status_count_hash['Total'][th_name];
                var val = status_value[th_name];
		if (val){
		    status_row = status_row + '<td style="'+th_style+' " class="show_hide" onclick="show_task_count_details(this);"><a><strong style="color: #00ff1e;">' + val + '</strong></a></td>';
		}else{
		    status_row = status_row + '<td style="'+th_style+'" class="show_hide"><strong>' + 0 + '</strong></td>';
		}
             }
        });
        row.append(status_row);
        $("#new_table").append(row);
    });// end of status_count_hash dict
//    progress_bar(status_count_hash);
}


function progress_bar(status_count_hash){

    $.each(status_count_hash, function(status_key, status_value){
		    $('#new_table th').each(function() {
		        th_name = $(this).attr('name');
		        var th_index = $(this).index();
		        var th_name_total = status_count_hash['Total'][th_name];
		        var val = status_value[th_name];

		        if(val){
		            /*$('#new_table tbody tr').find('td[status="'+status_key+'"]').find('.jqxProgressBar').jqxProgressBar(
		            {value: val, showText : true, max: th_name_total});*/

    	            //var ele = (val * th_name_total)/100;

		            $('#new_table tbody tr').find('td[status="'+status_key+'"]').find('.jqxProgressBar').progressbar({value:val, max: th_name_total});//children("span.caption").html(val);
		        }
		    });
    });
}

function create_new_table_status_count(div_check){

    var table = $('<table class="table-hover table-condensed table-bordered" id="new_table"/>');
    thead = $('<thead/>');
    tbody = $('<tbody />');

    var row = $(thead[0].insertRow(-1));

    var headerCell = $('<th style="width: 400px;" class="head_class" name="Status" title="Double Click to sort"/>');
    var header = "Status";

    headerCell.html('<i class="glyphicon glyphicon-sort-by-alphabet"></i>&nbsp;'+header);
    row.append(headerCell);

        if(div_check){
            col_val = $('#user_columns').val();
            col_arr = col_val.split(',');
        }
    $(div_check+' input[type="checkbox"]').each(function() {
        if($.contains(document, this)){
            var header = this.value;
            if (col_arr.indexOf(header) > -1){
                this.checked = true;
                show = "";
            }else{
                this.checked = false;
                show = "style='display:none'";
            }
            var headerCell = $('<th name="'+header+'" '+show+'/>');
            headerCell.html(header);
            row.append(headerCell);
        }
    });
    table.append(thead);
    table.append(tbody);

    var divTable = $('#div_status_count_details');
    divTable.html('');
    divTable.append(table);


}

/*
    get the cnt of status as key
    and value as task name with total
    count
*/
function get_status_hash(){
    var status_hash = {};
    var flag = {};
    $('#tbl_task td').each(function(index){

        var td_type = $(this).attr('data-id');
        if(td_type == 'show_status'){

            var status_name = $(this).text();
            var header_name = $(this).attr('title');

	    first_col = $(this).closest('tr').find('td:first-child').text();
	    arr = first_col.split(' ');
	    if (arr.length > 1)
		first_col = arr[1];

	    if (!flag[first_col])
		flag[first_col] = {};

	    if (flag[first_col][header_name])
		return true;

	    flag[first_col][header_name] = 1;

            if(!status_hash[status_name])
                status_hash[status_name] = {};

            if(!status_hash['Total'])
                status_hash['Total'] = {};

            if(!status_hash[status_name][header_name]){
                status_hash[status_name][header_name] = 1;
            }else{
                status_hash[status_name][header_name] ++;
	    }

            if(!status_hash['Total'][header_name]){
                status_hash['Total'][header_name] = 1;
            }else{
                status_hash['Total'][header_name] ++;
	    }
        }

    });

    var statuses = ['Outsource','Outsource Reject','Outsource Approved','Awaiting Data','Received Data','Ready to start','In progress','Ready to Publish','Pending Internal Review','Internal Reject','Internal Approved','Client Reject','Pending Client Review','Client approved','Completed','Total'];

    var new_status_hash = {};
    for (i in statuses){
	my_status = statuses[i];
	new_status_hash[my_status] = {};
	if (status_hash.hasOwnProperty(my_status)){
	    new_status_hash[my_status] = status_hash[my_status];
	}else{
	    $('#tbl_task th').each(function(index){
		head = $(this).text();
		new_status_hash[my_status][head] = 0;
	    });
	}
    }


//    var  selectedValue = $.map( $('#selectStatus').find("option").val(), function(n){
//              return this.value;
//       });
    return new_status_hash
}

function show_graphs(){

    var task_hash = {};
    $('#tbl_task td').each(function(index) {
	var td_type = $(this).attr('data-id');
	if (td_type == 'show_status'){
	    var td_name = $(this).text();
	    var th_name = $(this).attr('title');
	    key = th_name + ':' + td_name
	    if(!task_hash[th_name]){
		task_hash[th_name] = {};
	    }
	    if(!task_hash[th_name][td_name]){
		task_hash[th_name][td_name] = 1;
	    }else{
		task_hash[th_name][td_name]++;
	    }
	}
    });
    /*
          return dict in the form of key as status
                  and values a dict with task_name => total_cnt
    */
//    alert(task_hash['Previz']['Not started']);
    $main_div = $('#task_status_chart');
    $main_div.html('')

    div = '';
    for (var key in task_hash){
	if (task_hash.hasOwnProperty(key)) {
	    task_name = key.replace(/ /g,'_');
	    div_id = task_name +'_chart'
	    div = div + '<div class="col-lg-4" style="height:415px;" id="'+div_id+'" ></div>';
	}
    }
    $main_div.html(div);

    for (var key in task_hash){
	if (task_hash.hasOwnProperty(key)) {
	    task_name = key.replace(/ /g,'_');
	    div_id = task_name +'_chart'
	    var data = [];
	    for (var child_key in task_hash[key]){
		if (task_hash[key].hasOwnProperty(child_key)) {
		    data.push({x:task_hash[key][child_key], y:task_hash[key][child_key],name:child_key})
		}
	    }
	    chart_type = 'doughnut'
	    plot_chart(data,div_id,key,chart_type);
//	    alert(data[0]['name']);
	}
    }
}

function plot_chart(data,div_id,title_text,chart_type){

    var chart = new CanvasJS.Chart(div_id, {
    theme: "dark2",
    exportFileName: title_text,
    exportEnabled: true,
    animationEnabled: true,
    title:{
	text: title_text
    },
    legend:{
	cursor: "pointer",
	itemclick: explodePie
    },
    data: [{
	type: chart_type,
	innerRadius: 90,
	showInLegend: true,
	toolTipContent: "<b>{name}</b>: {x} (#percent%)",
	indexLabel: "{name} - {x}",
//	indexLabel: "{name} - #percent% ",
	legendText: "{name}",
//	legendText: "{name} - ({x})",
	dataPoints: data
    }]
});
chart.render();

function explodePie (e) {
    if(typeof (e.dataSeries.dataPoints[e.dataPointIndex].exploded) === "undefined" || !e.dataSeries.dataPoints[e.dataPointIndex].exploded) {
	e.dataSeries.dataPoints[e.dataPointIndex].exploded = true;
    } else {
	e.dataSeries.dataPoints[e.dataPointIndex].exploded = false;
    }
    e.chart.render();
}

}

function editUserCell(context){

    var OriginalContent = $(context).text();
    OriginalContent = OriginalContent.split(',')
    var row_stat = 'Users';

    var clone = $('#users_options').clone(true);
    $clonedChosen = clone.find('select').clone().off()

    $parentTd = $(context).closest('td');
    $parentTd.empty().append($($clonedChosen).show("show"));

    $select = $parentTd.find('select')
    $select.chosen({width: "200px"})

    $select.val(OriginalContent).trigger("liszt:updated");
    $select.trigger("chosen:updated");

    $select.trigger('chosen:open');
    $select.on('chosen:hiding_dropdown', function () {
        users = $select.val();
	user_text = '---';
	if (users){
	    user_text = users.join();
	}
        change_status(user_text,context,row_stat)
        change_multiple(user_text,context,row_stat);
    });

}

function editCell(context){

    var OriginalContent = $(context).text();
    OriginalContent = OriginalContent.replace(/^\s+/ig,'');
    OriginalContent = OriginalContent.replace(/\s+$/ig,'');
    var row_stat = 'Status';

    var clone = $('#status_options').clone(true);
    $clonedChosen = clone.find('select').clone().off()

    $parentTd = $(context).closest('td');
    $parentTd.empty().append($($clonedChosen).show("show"));

    $select = $parentTd.find('select')
    $select.chosen({width: "150px"})

    $select.val(OriginalContent).trigger("liszt:updated");
    $select.trigger("chosen:updated");

    $select.trigger('chosen:open');
    $select.on('chosen:hiding_dropdown', function () {
        status_text = $(this).val();
        change_status(status_text,context,row_stat)
        change_multiple(status_text,context,row_stat);
    });

}

function change_status(status_text,context,row_stat){

    org_val = $(context).attr('data-org-val');
    label = status_text.replace(/ /g,"_").toLowerCase();
    col_data = '<span class="label label-'+label+'">'+status_text+'</span>'
    if (row_stat == 'Users'){
        col_data = '<span class="label label-default">'+status_text+'</span>'
    }
    $(context).html(col_data);
    if (org_val == status_text){
        $(context).find('input:hidden[name=modifiedRow]').remove();
        if (!($(context).parent('tr').find('td input:hidden[name=modifiedRow]').length)){
            $(context).parent('tr').removeAttr('style');
        };
    }else{
        $(context).append('<input type="hidden" name="modifiedRow" value="'+row_stat+'" />');
        $(context).parent('tr').css({'background-color':'#52436F'});
	if ($(context).attr('table-type') == 'versions'){
	    $("#save_ver_changes").css({'background-color':'#52436F'});
	}else{
	    $("#save_changes").css({'background-color':'#52436F'});
	}
    }

}

function change_multiple(status_text,context,row_stat){

    var idx = $(context).index();
/*
    if ($(context).attr('table-type') != 'versions'){
	idx--;
    }
*/

    tbl_id = $(context).closest('table').attr('id');
    $('#'+tbl_id+' tr.selected').each(function(){
        cell = $(this).find('td:eq('+idx+')');
        change_status(status_text,cell,row_stat)
    });

}

$("#undo").click(function(){
    removeSelections('tbl_task');
});

$("#undo_ver").click(function(){
    removeSelections('tbl_versions');
});
function removeSelections(table){

    $('#'+table+' td input:hidden[name=modifiedRow]').each(function(){
        row_stat = this.value;
        org_val = $(this).closest('td').attr('data-org-val');
	if (table == 'tbl_task'){
	    $("#save_changes").css({'background-color':'#555555'});
	}else{
	    $("#save_ver_changes").css({'background-color':'#555555'});
	}
        $(this).parent().parent().removeAttr('style');

        label = org_val.replace(/ /g,"_").toLowerCase();
        col_data = '<span class="label label-'+label+'">'+org_val+'</span>'
        if(row_stat == 'Users'){
            col_data = '<span class="label label-default">'+org_val+'</span>'
        }
        $(this).parent().html(col_data);
    });
       $('#'+table+' tr.selected').each(function(){
                $(this).removeClass("selected");
        });
}


$("#save_changes").click(function(){

    var data_array = [];
    var proj_id = $("#selectProject").val();
    var object_type = $("#selectObject").val();

    $('#tbl_task td input:hidden[name=modifiedRow]').each(function(){
        var row_stat = this.value;
        var valueToPush = [];
        var col=$(this).closest('td');
        var col_idx = col.index();
        var row=$(this).closest('tr');
        var row_val = col.attr('data-task-id');
        var th_name = col.attr('title');
        var row_note = col.attr('data-task-note');
        var row_parent_id = col.attr('data-parent-id');
        var row_org_val = col.attr('data-org-val');

        valueToPush[0] = col.text(); // status name or username
        valueToPush[1] = row_val; // task id
        valueToPush[2] = th_name; // title attribute in <td>
        valueToPush[3] = row_stat; // Status or User
        valueToPush[4] = row_note; // note
        valueToPush[5] = row_parent_id; // parent id
        valueToPush[6] = proj_id; // parent id
        valueToPush[7] = object_type; // object_type
        valueToPush[8] = row_org_val; // original value

        data_array.push(valueToPush);
        col.attr('data-org-val',col.text());
    });
    object_name = 'Save Changes';
    if (data_array.length != 0){
        save_changes(data_array,object_name);
        removeSelections('tbl_task');
    }

});
$("#save_ver_changes").click(function(){

    var data_array = [];
    var proj_id = $("#selectProject").val();
    var object_type = $("#selectObject").val();

    $('#tbl_versions td input:hidden[name=modifiedRow]').each(function(){
	var col=$(this).closest('td');

        var row_stat = col.text();
        var row_version_id = col.attr('data-version-id');
        var row_org_val = col.attr('data-org-val');

        var valueToPush = [];
        valueToPush[0] = row_stat; // status name or username
        valueToPush[1] = row_version_id; // object_type
        valueToPush[2] = row_org_val; // original value

        data_array.push(valueToPush);
        col.attr('data-org-val',col.text());
    });
    object_name = 'Save Version Changes';
    if (data_array.length != 0){
        save_changes(data_array,object_name);
        removeSelections('tbl_versions');
    }

});
function save_changes(data_array,object_name) {
    var proj_id = $("#selectProject").val();
    data = JSON.stringify(data_array);
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'object_name': object_name, 'data_list': data, 'proj_id': proj_id},
        beforeSend: function(){
        },
        success: function(json){
            $.each(json, function (idx, obj) {
            });

            noty({
                text: 'Your changes were saved',
                layout: 'topCenter',
                closeWith: ['click', 'hover'],
                type: 'success'
            });
        },
        error: function(error){
            console.log("Error:");
            console.log(error);
        }
    });
}
$("#search").keyup(function(){
    _this = this;
    // Show only matching TR, hide rest of them
   if ($(this).val() === ''){
        $(this).css({"border-color": "#333"})
    }else{
        $(this).css({"border-color": "#5897fb"})
    }
    $.each($("#tbl_task tbody tr"), function(idx) {
        if($(this).text().toLowerCase().indexOf($(_this).val().toLowerCase()) === -1)
            $(this).hide();
        else
            $(this).show();
        });
    len = $('#tbl_task tbody tr:visible').length;
    $('#table_row_count').html(len);
});

$("#search_version").keyup(function(){
    _this = this;
    // Show only matching TR, hide rest of them
   if ($(this).val() === ''){
        $(this).css({"border-color": "#333"})
    }else{
        $(this).css({"border-color": "#5897fb"})
    }
    $.each($("#tbl_versions tbody tr"), function(idx) {
        if($(this).text().toLowerCase().indexOf($(_this).val().toLowerCase()) === -1)
            $(this).hide();
        else
            $(this).show();
        });
});
$("#search_value").keyup(function(){
    _this = this;
    table = $(this).attr('table_name');
    // Show only matching TR, hide rest of them
   if ($(this).val() === ''){
        $(this).css({"border-color": "#333"})
    }else{
        $(this).css({"border-color": "#5897fb"})
    }
    $.each($("#"+table+" tbody tr"), function(idx) {
        if($(this).text().toLowerCase().indexOf($(_this).val().toLowerCase()) === -1)
            $(this).hide();
        else
            $(this).show();
        });
});
function demoFromHTML() {
    update()
}

$('#div_dash_sequence_details').on('scroll', function(){
   var translate = "translate(0,"+this.scrollTop+"px)";
   this.querySelector("thead").style.transform = translate;
});
$('#div_dash_asset_build_details').on('scroll', function(){
   var translate = "translate(0,"+this.scrollTop+"px)";
   this.querySelector("thead").style.transform = translate;
});
$('#div_user_task_details').on('scroll', function(){
   var translate = "translate(0,"+this.scrollTop+"px)";
   this.querySelector("thead").style.transform = translate;
});
$('#div_task_details').on('scroll', function(){
   var translate = "translate(0,"+this.scrollTop+"px)";
   this.querySelector("thead").style.transform = translate;
});
$('#div_user_details').on('scroll', function(){
   var translate = "translate(0,"+this.scrollTop+"px)";
   this.querySelector("thead").style.transform = translate;
});
$('#div_asset_user_details').on('scroll', function(){
   var translate = "translate(0,"+this.scrollTop+"px)";
   this.querySelector("thead").style.transform = translate;
});
$('#div_shot_user_details').on('scroll', function(){
   var translate = "translate(0,"+this.scrollTop+"px)";
   this.querySelector("thead").style.transform = translate;
});

function update() {
            var doc = new jsPDF();
            var elem = $('#tbl_task');
            var res = doc.autoTableHtmlToJson(elem);
            doc.autoTable(res.columns, res.data, {startY: 20});

        doc.save('table.pdf');
    }

function sortOrder(header){
    var table = $(header).closest('table');

    $(header)
        .wrapInner('<span title="sort this column"/>')
        .each(function(){

            var th = $(this),
                thIndex = th.index(),
                inverse = false;

            th.click(function(){

                table.find('td').filter(function(){

                    return $(this).index() === thIndex;

                }).sortElements(function(a, b){

                    return $.text([a]) > $.text([b]) ?
                        inverse ? -1 : 1
                        : inverse ? 1 : -1;

                }, function(){

                    return this.parentNode;

                });

                inverse = !inverse;

            });

        });
}

function toggle_note(param) {
    id = $(param).find('option:selected').attr('id');
    category = $(param).val();
    category = category.replace(/ /g,"_");
    cat_id = "category-"+category+"-"+id
    all_cat_id = "category-"
    $('[id^="'+cat_id+'"]').css({'display':'block'});
    $('[id^="'+all_cat_id+'"]').each(function(index){
        this_id = $(this).attr('id')
        var patt = new RegExp(cat_id);
        var match = patt.test(this_id);
        if (!match){
            $(this).css({"display":"none"});
        }
    })
}

function editArtistCell(context){

    var OriginalContent = $(context).text();
    OriginalContent = OriginalContent.replace(/^\s+/ig,'');
    OriginalContent = OriginalContent.replace(/\s+$/ig,'');
    var row_stat = 'Status';

    var clone = $('#status_options').clone(true);
    $clonedChosen = clone.find('select').clone().off()

    $parentTd = $(context).closest('td');
    $parentTd.empty().append($($clonedChosen).show("show"));

    $select = $parentTd.find('select')
    $select.chosen({width: "150px"})

    $select.val(OriginalContent).trigger("liszt:updated");
    $select.trigger("chosen:updated");

    $select.trigger('chosen:open');

    proj_id = $parentTd.attr('data-project-id')
    if (proj_id){
	$('#selectProject').val(proj_id).trigger("liszt:updated");
	$('#selectProject').trigger("chosen:updated");
    }

    $select.on('chosen:hiding_dropdown', function () {
        status_text = $(this).val();
        change_status(status_text,context,row_stat)
        change_multiple(status_text,context,row_stat);
    });

}
function toggle_view(context){
    act_id = $(context).attr('id');
    id = act_id.split('-')[1]
    a_val = $(context).val();
    $('#reject_note-'+id).val('');
    $('#reject_note_accordion-'+id).fadeOut(350);
    $('#reject_notepad-'+id).fadeOut(350);
    if (a_val == 'View'){
	show_version_notes(context);
	$('#reject_note_accordion-'+id).fadeIn(350);
    }else if (a_val == 'Reject'){
	$('#reject_notepad-'+id).fadeIn(350);
    }
}
function toggle_linkview(context){
    act_id = $(context).attr('id');
    id = act_id.split('-')[1]
    a_val = $(context).val();
    $('#link_reject_note-'+id).val('');
    $('#link_reject_note_accordion-'+id).fadeOut(350);
    $('#link_reject_notepad-'+id).fadeOut(350);
    if (a_val == 'View'){
	show_linkversion_notes(context);
	$('#link_reject_note_accordion-'+id).fadeIn(350);
    }else if (a_val == 'Reject'){
	$('#link_reject_notepad-'+id).fadeIn(350);
    }
}
function show_versions(context){

    task_id = $('#selectVersionTask').val();
    asset_type = $('#selectVersionTaskAssetTypes').val();
    object_type = $('#selectObject').val();

    task_for = $(context).attr('data-for-artist');

    if (task_id == ''){
	alert("Please select task");
	return null;
    }else if (asset_type == ''){
	alert("Please select asset type");
	return null;
    }

    //var object_id = $('#data-modal-object-id').val();
    if($('#user_reject_asset').prop("checked") == true){
        var object_id = $('#selectVersionAssetBuild').val();
    }else{
        if (task_for == 'to_do'){
	var object_id = $('#data-modal-object-id').attr('data-modal-parent-id');
    }else{
    var object_id = $('#data-modal-object-id').val();

    }
    }


    $select_elem = $('#selectTaskVersion');
    if (object_id){
	load_versions(object_id, task_id, asset_type, object_type, $select_elem)
    }

}

// Show Asset Type

function load_asset_type(context){

    /*chk = $('#user_reject_asset').is(':checked');
    if(chk == true){
        parent_id = $('#selectVersionAssetBuild').val();
        parent_name = $('#selectVersionAssetBuild').text();

    }
    else{
        parent_id = $('#data-modal-object-id').attr('data-modal-parent-id');

    }*/

    parent_name = $('#selectVersionTask option:selected').text();

    //call
    $select_elem = $('#selectVersionTaskAssetTypes');
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'parent_name' : parent_name, 'object_name': 'Load Asset Type'},
        beforeSend: function(){
	    $select_elem.empty();
	    $select_elem.append('<option value="">Select Asset Type</option>');
        },
        success: function(json){
            $.each(json, function (idx, obj) {
		    $select_elem.append('<option value="'+obj+'">' + obj+ '</option>');
            });
            $select_elem.trigger("chosen:updated");
            $select_elem.trigger("liszt:updated");
            $select_elem.data("chosen").destroy().chosen();
        },
        error: function(error){
            console.log("Error:");
            console.log(error);
        }
    });

}

function show_asset_type(context){

    chk = $('#user_reject_asset').is(':checked');
    console.log("chk: " + chk);
    if(chk == true){
        console.log("if:");
        parent_id = $('#selectVersionAssetBuild').val();
    }
    else{
        console.log("else:");
        parent_id = $('#data-modal-object-id').attr('data-modal-parent-id');
    }
    console.log("inside show_asset_type parent_id : " + parent_id);
    //call

    $select_elem = $('#selectVersionTaskAssetTypes');
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'parent_id' : parent_id, 'object_name': 'Ftp Asset Type'},
        beforeSend: function(){
	    $select_elem.empty();
	    $select_elem.append('<option value="">Select Asset Type</option>');
        },
        success: function(json){
            $.each(json, function (idx, obj) {
		    $select_elem.append('<option value="'+obj.name+'">' + obj.name + '</option>');
            });
            $select_elem.trigger("chosen:updated");
            $select_elem.trigger("liszt:updated");
            $select_elem.data("chosen").destroy().chosen();
        },
        error: function(error){
            console.log("Error:");
            console.log(error);
        }
    });

}

function show_linkversions(context){
    attr_id = $(context).attr('id');
    id = attr_id.split('-')[1];

    act_val = $('#selectLinkView-'+id).val();
    dept_val = $('#selectLinkDepartment-'+id).val();
    atype_val = $('#selectLinkAssetType-'+id).val();

    if (dept_val == ''){
	alert("Please select department");
	return null;
    }else if (atype_val == ''){
	alert("Please select asset type");
	return null;
    }

    build_val = $('#selectLinkDepartment-'+id).attr('data-asset-build');
    $select_elem = $('#selectLinkVersion-'+id)
    load_versions('',dept_val,atype_val,$select_elem,build_val)

}
function load_versions(object_id, task_id, asset_type, object_type, $select_elem) {
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'object_id': object_id ,'object_name': 'Versions', 'asset_type': asset_type , 'task_id': task_id, 'object_type': object_type},
        beforeSend: function(){
        },
        success: function(json){
	    $select_elem.empty();
	    $select_elem.append('<option value="">Select Version</option>');
            $.each(json, function (idx, obj) {
		$select_elem.append('<option value="'+obj.id+'">'+obj.name+'</option>');
            });
	    $select_elem.trigger("chosen:updated");
	    $select_elem.trigger("liszt:updated");
	    $select_elem.data("chosen").destroy().chosen();
        },
        error: function(error){
            console.log("Error:");
            console.log(error);
        }
    });
}

function show_version_notes(context){
    ver_id = $('#selectTaskVersion').val();
    if (ver_id == ''){
	alert("Please select version !!");
	return null;
    }
    $('#version_note_details').html('');
    version_notes(ver_id);
    $('#btn_version_note_create').attr('data-version-id',ver_id);
}

function version_notes(task_id,obj_name,last_row,task) {

    $("#task_version_notes_loader").show();
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'task_id': task_id , 'type_name': obj_name, 'last_row' : last_row, 'task': task , 'object_name': 'Version Note'},
        // beforeSend: function(){
        // },
        success: function(json){
            $.each(json, function (idx, obj){
                modal_body = add_note_details(idx, obj);
                $('#version_note_details').append(modal_body);
        		// add_version_notes(obj,id,idx);
            });
	$("#task_version_notes_loader").hide();
        },
        error: function(error){
            console.log("Error:");
            console.log(error);
        }
    });
 }

$('#btn_version_note_create').click(function(){
    version_id = $('#selectTaskVersion').val();
    if(version_id){
	create_version_note(version_id, obj_name);
    }else{
	alert("Please select version !!!");
	return null;
    }

});

function create_version_note(version_id, obj_name){

    $textarea_id = $('#text_version_note');
    var note_text = $textarea_id.val().trim();
    //var note_category = $('#selectVersionNoteCategory').val();
    task_for = $('#selectVersionNoteCategory').attr('data-for-artist');
    if (task_for == 'to_do'){
        var note_category = 'Internal';
    }
    else{
        var note_category = $('#selectVersionNoteCategory').val();
    }

    if (!(note_text.length && version_id)){
	alert("invalid note ...");
	return null;
    }
    if (!(note_category)){
	alert("Please select valid category ...");
	return null;
    }

    attachments = [];
    $textarea_id.parent().find('table[id=gallery_versions] tr td a').each(function(){
	href = $(this).attr('href');
	attachments.push(href);
    });

    attach_files = JSON.stringify(attachments);

    note_task = '';
    note_for = 'AssetVersion';
    $div_element = $('#version_note_details');
    create_new_note(version_id, note_text, note_category, note_for, $div_element, $textarea_id, note_task, attach_files, obj_name);

    $textarea_id.parent().find('table[id=gallery_versions] tbody').html('');

    // for internal reject
    if($('#internal-reject').prop("checked") == true){
        internal_reject_task(version_id, note_text, note_category, note_for, note_task, attach_files);

    }


}

function add_version_notes(obj,id,idx){

note_author = obj.note_author;
note_head = obj.note_head;
note_replies = obj.replies;
note_category = obj.note_category;
note_date = obj.note_date;
note_id = obj.note_id;
++idx;
pid = id
id = pid+'_'+idx;

notehead = '\
    <div class="panel panel-default" id="note_category-'+id+'">\
	<div class="panel-heading">\
	    <i class="glyphicon glyphicon-envelope"></i>&nbsp;&nbsp;\
	    <span class="label2 label-'+note_category+'">'+note_category+'</span>\
	    <a data-toggle="collapse" data-parent="#reject_note_accordion-'+pid+'" href="#note_collapse-'+id+'" style="text-decoration: none;">\
	    <span class="label label-default" style="width:63%">'+note_author+' : '+note_head+'</span></a>\
	    <span class="label2 label-info">'+note_date+'</span>\
	</div>\
    </div>\
';
notebody = '\
    <div id="note_collapse-'+id+'" class="panel-collapse collapse">\
	<div class="panel-body" style="padding: 0px;">\
	    <div class="box" style="overflow:auto; height:195px; margin: 10px;">';
    replies = '';
    for (index in note_replies){
	replies = replies + '<p>'+note_replies[index]+'</p>';
    }
body2 = replies + '\
	    </div>\
';

notetail = '\
    <div id="reject_notepad-'+id+'" style="display:block">\
        <div class="box" style="margin: 10px;">\
            <table>\
                <tr>\
                    <td>\
                        <textarea cols=90 rows=2 data-note-id="'+note_id+'" id="reply_ver_note_text-'+id+'" required="" style="color:black;"></textarea>\
                    </td>\
                    <td>\
                        <button id="reply_ver_note-'+id+'" class="btn btn-inverse btn-default btn-lg" onclick="reply_ver_note(this)">Reply</button>\
                    </td>\
                </tr>\
            </table>\
        </div>\
    </div>\
';
notetailend = '\
    </div>\
</div>\
';
$('#reject_note_accordion-'+pid).append(notehead+notebody+body2+notetail+notetailend);
}

function reply_ver_note(context){

    attr_id = $(context).attr('id');
    id = attr_id.split('-')[1];
    reply_text = $('#reply_ver_note_text-'+id).val();
    if (reply_text == ''){
	alert("Give some reply !!!");
	return null;
    }
    note_id = $('#reply_ver_note_text-'+id).attr('data-note-id');
    reply_note(reply_text,note_id);
    $('#reply_ver_note_text-'+id).val('');
    location.reload();
}

function show_linkversion_notes(context){
    attr_id = $(context).attr('id');
    id = attr_id.split('-')[1]
    ver_id = $('#selectLinkVersion-'+id).val();
    if (ver_id == ''){
	alert("Please select version !!");
	return null;
    }
    $('#link_reject_note_accordion-'+id).html('');
    link_version_notes(ver_id,id);
}

function link_version_notes(ver_id,id) {
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'object_name': 'Version Note', 'ver_id': ver_id},
        beforeSend: function(){
        },
        success: function(json){
            $.each(json, function (idx, obj) {
		add_linkversion_notes(obj,id,idx);
            });
        },
        error: function(error){
            console.log("Error:");
            console.log(error);
        }
    });
}

function add_linkversion_notes(obj,id,idx){

note_author = obj.note_author;
note_head = obj.note_head;
note_replies = obj.replies;
note_category = obj.note_category;
note_date = obj.note_date;
note_id = obj.note_id;
++idx;
pid = id
id = pid+'_'+idx;

notehead = '\
    <div class="panel panel-default" id="link_note_category-'+id+'">\
	<div class="panel-heading">\
	    <i class="glyphicon glyphicon-envelope"></i>&nbsp;&nbsp;\
	    <span class="label2 label-'+note_category+'">'+note_category+'</span>\
	    <a data-toggle="collapse" data-parent="#link_reject_note_accordion-'+pid+'" href="#link_note_collapse-'+id+'" style="text-decoration: none;">\
	    <span class="label label-default" style="width:63%">'+note_author+' : '+note_head+'</span></a>\
	    <span class="label2 label-info">'+note_date+'</span>\
	</div>\
    </div>\
';
notebody = '\
    <div id="link_note_collapse-'+id+'" class="panel-collapse collapse">\
	<div class="panel-body" style="padding: 0px;">\
	    <div class="box" style="overflow:auto; height:195px; margin: 10px;">';
    replies = '';
    for (index in note_replies){
	replies = replies + '<p>'+note_replies[index]+'</p>';
    }
body2 = replies + '\
	    </div>\
';

notetail = '\
    <div id="link_reject_notepad-'+id+'" style="display:block">\
        <div class="box" style="margin: 10px;">\
            <table>\
                <tr>\
                    <td>\
                        <textarea cols=90 rows=2 data-note-id="'+note_id+'" id="link_reply_ver_note_text-'+id+'" required="" style="color:black;"></textarea>\
                    </td>\
                    <td>\
                        <button id="link_reply_ver_note-'+id+'" class="btn btn-inverse btn-default btn-lg" onclick="link_reply_ver_note(this)">Reply</button>\
                    </td>\
                </tr>\
            </table>\
        </div>\
    </div>\
';
notetailend = '\
    </div>\
</div>\
';
$('#link_reject_note_accordion-'+pid).append(notehead+notebody+body2+notetail+notetailend);
}

function link_reply_ver_note(context){

    attr_id = $(context).attr('id');
    id = attr_id.split('-')[1];
    reply_text = $('#link_reply_ver_note_text-'+id).val();
    if (reply_text == ''){
	alert("Give some reply !!!");
	return null;
    }
    note_id = $('#link_reply_ver_note_text-'+id).attr('data-note-id');
    reply_note(reply_text,note_id);
    $('#link_reply_ver_note_text-'+id).val('');
    location.reload();
}

function reply_note(reply_text,note_id) {
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'object_name': 'Reply Note', 'note_id': note_id, 'reply_text': reply_text},
        beforeSend: function(){
        },
        success: function(json){
            $.each(json, function (idx, obj) {
            });

            noty({
                text: 'Reply has been given ...',
                layout: 'topCenter',
                closeWith: ['click', 'hover'],
                type: 'success'
            });
        },
        error: function(error){
            console.log("Error:");
            console.log(error);
        }
    });
}
function add_note(context){

    attr_id = $(context).attr('id');
    id = attr_id.split('-')[1]
    ver_id = $('#selectVersion-'+id).val();
    note = $('#reject_note-'+id).val();
    if (ver_id == ''){
	alert("Please select version !!");
	return null;
    }
    if (note == ''){
	alert("Note is empty !!");
	return null;
    }
    var col = $('#selectVersion-'+id).closest('td');
    task_name =	col.attr('data-task-name');
    note = task_name+' : '+note;
    save_note(note,ver_id);
    $('#reject_notepad-'+id).fadeOut(350);
}

function add_linknote(context){

    attr_id = $(context).attr('id');
    id = attr_id.split('-')[1]
    ver_id = $('#selectLinkVersion-'+id).val();
    note = $('#link_reject_note-'+id).val();
    if (ver_id == ''){
	alert("Please select version !!");
	return null;
    }
    if (note == ''){
	alert("Note is empty !!");
	return null;
    }
    var col = $('#selectLinkVersion-'+id).closest('td');
    task_name =	col.attr('data-task-name');
    note = task_name+' : '+note;
    save_note(note,ver_id);
    $('#link_reject_notepad-'+id).fadeOut(350);
}
function save_note(note,ver_id) {
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'object_name': 'User Note', 'note': note, 'ver_id': ver_id},
        beforeSend: function(){
        },
        success: function(json){
            $.each(json, function (idx, obj) {
            });

            noty({
                text: 'Note has been posted',
                layout: 'topCenter',
                closeWith: ['click', 'hover'],
                type: 'success'
            });
        },
        error: function(error){
            console.log("Error:");
            console.log(error);
        }
    });
}

$(function() {

    $('[data-popup-open]').on('click', function(e)  {
        var targeted_popup_class = jQuery(this).attr('data-popup-open');
        $('[data-popup="' + targeted_popup_class + '"]').fadeIn(350);
        e.preventDefault();
    });


    $('[data-popup-close]').on('click', function(e)  {
        var targeted_popup_class = jQuery(this).attr('data-popup-close');
        $('[data-popup="' + targeted_popup_class + '"]').fadeOut(350);

        e.preventDefault();
    });
});

/*
$('#selectProject').change(function(){
    var proj_id = $("#selectProject").val();
    if (!proj_id){
        alert("Please select valid project !!");
        return null;
    }
    $('#all_ftp_shots').attr('checked',false);
    var obj_name = 'FtpSequence';
    load_obj_name(obj_name,'');
});
*/


function refresh_shots(){

    var obj_name = 'FtpShot';
    seqs = $('#selectFtpSequence').val();
    selected_shots = $("#selectFtpShot").val();
    for (i in seqs){
	selectedValue = seqs[i]
	load_ftp_shots(obj_name,selectedValue,selected_shots);
    }
}

function refresh_asset_builds(){

    var obj_name = 'FtpAsset';
    selected_shots = $("#selectFtpAsset").val();
    load_ftp_shots(obj_name,'',selected_shots);
}
function load_ftp_shots(obj_name,parent_id,selected_shots) {

    var project = $('#selectProject').val();
    if (!project){
        alert("Please select valid project !!")
        return null
    }

    var client_final_combo = $("#selectFtpAssetName").val();
    var select_type = ''
    var $div_name = ''
    var $select_elem = ''
    var task_name = ''
    var status_name = ''
    var shots_exist = [];

    if (obj_name == 'FtpShot'){
	$select_elem = $("#selectFtpShot");
        $div_name = $("#div_shot_name");
        shots_exist = $("#selectFtpShot").val();
	task_name = $("#selectShotFtpDepartment").val();
	status_name = $("#selectFtpStatus").val();
    }else if (obj_name == 'FtpAsset'){
	$select_elem = $("#selectFtpAsset");
        $div_name = $("#div_asset_name");
	task_name = $("#selectAssetFtpDepartment").val();
	status_name = $("#selectFtpStatus").val();
        select_type = $("#selectFtpType").val();
    }else{
        return null
    }

    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'proj_id': project ,'object_name': obj_name , 'object_type' : select_type, 'parent_id' : parent_id, 'task_name': task_name, 'status_name': status_name, 'upload_for':client_final_combo},
        beforeSend: function(){
	    $select_elem.empty();
            $div_name.css({'display':'block'});
        },
        success: function(json){
            $.each(json, function (idx, obj) {
		opt_text = ''
		opt_id = obj.id
                if(parent_id){
		    opt_text = obj.parent_name+'_'+obj.name
                }else{
		    opt_text = obj.name
                }
		$select_elem.append('<option value="'+opt_id+'">' + opt_text + '</option>');
		if (selected_shots){
		    shot_idx = selected_shots.indexOf(opt_id)
		    if (shot_idx > -1){
			if (obj_name == 'FtpShot'){
			    $("#selectFtpShot option[value='"+selected_shots[shot_idx]+"']").prop('selected', true);
			}else if (obj_name == 'FtpAsset'){
			    $("#selectFtpAsset option[value='"+selected_shots[shot_idx]+"']").prop('selected', true);
			}
		    }
		}
            });
            $select_elem.trigger("chosen:updated");
            $select_elem.trigger("liszt:updated");
            $select_elem.data("chosen").destroy().chosen();
        },
        error: function(error){
            console.log("Error:");
            console.log(error);
        }
    });
}

function load_ftp_asset_type(parent_id) {

    $select_elem = $('#selectFtpAssetType');
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'parent_id' : parent_id, 'object_name': 'Ftp Asset Type'},
        beforeSend: function(){
	    $select_elem.empty();
	    $select_elem.append('<option value="">Select one ...</option>');
        },
        success: function(json){
            $.each(json, function (idx, obj) {
		$select_elem.append('<option value="'+obj.name+'">' + obj.name + '</option>');
            });
            $select_elem.trigger("chosen:updated");
            $select_elem.trigger("liszt:updated");
            $select_elem.data("chosen").destroy().chosen();
        },
        error: function(error){
            console.log("Error:");
            console.log(error);
        }
    });
}

function load_client_version(name) {

    var object_name = '';
    var id = $("#selectProject").val();
    var project_name = $("#selectProject option[value='"+id+"']").text()
    var component_select = $("#selectComponent").val();
    var obj_name = $("#selectClientObject").val();
    var asset_build_type = $("#selectClientType").val();

    if (component_select == 'Internal'){
        object_name = 'client_version';
    }
    else if (component_select == 'Client'){
        object_name = 'client_side_versions';
    }

    $select_elem = $('#selectClientVersion');
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'project_name': project_name, 'parent_name' : name, 'object_name': object_name, 'task_prefer': obj_name, 'build_type': asset_build_type},
        beforeSend: function(){
	    $select_elem.empty();
//	    $select_elem.append('<option value="">Select one ...</option>');
        },
        success: function(json){
            $.each(json, function (idx, obj) {
		$select_elem.append('<option value="'+obj.version_path+'">' + obj.version_name + '</option>');
            });
            $select_elem.trigger("chosen:updated");
            $select_elem.trigger("liszt:updated");
            $select_elem.data("chosen").destroy().chosen();
        },
        error: function(error){
            console.log("Error:");
            console.log(error);
        }
    });
}
function load_ftp_asset_name(parent_id) {

    asset_type = $('#selectFtpAssetType').val();
    if(!asset_type){
	alert("Please select valid asset type !!!");
	return null;
    }

    $select_elem = $('#selectFtpAssetName');
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'parent_id' : parent_id, 'object_name': 'Ftp Asset Name', 'asset_type': asset_type},
        beforeSend: function(){
	    $select_elem.empty();
	    $select_elem.append('<option value="">Select one ...</option>');
        },
        success: function(json){
            $.each(json, function (idx, obj) {
		$select_elem.append('<option value="'+obj.name+'">' + obj.name + '</option>');
            });
            $select_elem.trigger("chosen:updated");
            $select_elem.trigger("liszt:updated");
            $select_elem.data("chosen").destroy().chosen();
        },
        error: function(error){
            console.log("Error:");
            console.log(error);
        }
    });
}
function load_ftp_components(parent_id,dept) {

    asset_name = $('#selectFtpAssetName').val();
    if(!asset_name){
	alert("Please select valid asset name !!!");
	return null;
    }

    upload_for = $('#selectFtpStatus').val();

    $select_elem = $('#selectFtpExt');
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'parent_id' : parent_id, 'object_name': 'Ftp Component', 'asset_name': asset_name, 'department': dept, 'upload_for': upload_for},
        beforeSend: function(){
	    $select_elem.empty();
	    $select_elem.append('<option value="">Select one ...</option>');
        },
        success: function(json){
            $.each(json, function (idx, obj) {
		$select_elem.append('<option value="'+obj.name+'">' + obj.name + '</option>');
            });
            $select_elem.trigger("chosen:updated");
            $select_elem.trigger("liszt:updated");
            $select_elem.data("chosen").destroy().chosen();
        },
        error: function(error){
            console.log("Error:");
            console.log(error);
        }
    });
}

$('#selectFtpAssetName').change(function(){

    obj = $('#selectFtpObject').val();
    parent_id = ''
    values = ''
    dept = ''

    upload_notes();
    $('#selectFtpVersionSide').val('').trigger("liszt:updated").trigger("chosen:updated");

    if (obj == 'Shot'){
	values = $('#selectFtpShot').val();
	dept = $('#selectShotFtpDepartment').val();
    }else if (obj == 'Asset Build'){
	values = $('#selectFtpAsset').val();
	dept = $('#selectAssetFtpDepartment').val();
    }

    if(!dept){
	alert("Please select valid department !!!");
	return null;
    }

    if (values){
	parent_id = values[0];
    }else{
	alert("Please select "+obj);
	return null;
    }
    load_ftp_components(parent_id,dept);
});
/*
$('#selectFtpAssetName').change(function(){

    $("#extended_div").css("display", "block");

    upload_notes()

    $('#selectFtpVersionSide').val('').trigger("liszt:updated").trigger("chosen:updated");
    asset_name = $(this).val();
    if (!asset_name){
	alert("Please select valid asset name !!!");
	$('#div_ext_name').css({'display':'none'});
	return null;
    }
    $('#div_ext_name').css({'display':'block'})
    $select_elem = $('#selectFtpExt');
    $select_elem.empty();
    if (asset_name == 'final' && $('#selectFtpStatus').val() == 'Client') {
        $select_elem.append('<option value="exr">exr</option>');
    }else if (asset_name == 'final') {
        $select_elem.append('<option value="">Select Ext.</option>');
        $select_elem.append('<option value="exr">exr</option>');
        $select_elem.append('<option value="jpg">jpg</option>');
        $select_elem.append('<option value="mov">mov</option>');
	$('#selectFtpVersionSide').val('both').trigger("liszt:updated").trigger("chosen:updated");
    }else if (asset_name == 'sequence') {
        $select_elem.append('<option value="">Select Ext.</option>');
        $select_elem.append('<option value="mov">mov</option>');
        $select_elem.append('<option value="exr">exr</option>');
    }else if (asset_name == 'static') {
        $select_elem.append('<option value="jpg" selected>jpg</option>');
    }else if (asset_name == 'geom') {
        $select_elem.append('<option value="">Select Ext.</option>');
        $select_elem.append('<option value="review_img">review_img</option>');
        $select_elem.append('<option value="review_mov">review_mov</option>');
    }else if (asset_name == 'review') {
        $select_elem.append('<option value="mov" selected>mov</option>');
    }
    $select_elem.trigger("chosen:updated");
    $select_elem.trigger("liszt:updated");
    $select_elem.data("chosen").destroy().chosen();

    obj = $('#selectFtpObject').val();
    if (obj == 'Sequence'){
	refresh_shots()
    }else if (obj == 'Asset Build'){
	refresh_asset_builds()
    }
});
*/
function show_upload_version(){

    $('#tbl_ftp_version tbody').empty();

    proj = $('#selectProject').val();
    stat = $('#selectFtpStatus').val();
    ass = $('#selectFtpAssetName').val();
    ext = $('#selectFtpExt').val();
    side = $('#selectFtpVersionSide').val();
    copy_opt = $('input[name="optradio"]:checked').val();
    dest_path = $('#dest_path').val();
    dest_path = dest_path.replace(/\s/g,'');


    if (!proj){
	alert("Please select project !!!");
	return null;
    } else if (!stat){
	alert("Please select status !!!");
	return null;
    } else if (!ass){
	alert("Please select asset name !!!");
	return null;
    } else if (!ext){
	alert("Please select Components !!!");
	return null;
    }
//    else if (!copy_opt){
//	alert("Please check copy or symlink !!!");
//	return null;
//    }
    else if (!dest_path){
	alert("Please valid destination path !!!");
	return null;
    }

    var data_array = [];
    proj_name = $("#selectProject option[value='"+proj+"']").text();
    obj = $('#selectFtpObject').val();

    if (obj == 'Shot'){
	dept = $('#selectShotFtpDepartment').val();
	seq = $('#selectFtpSequence').val();
	shot = $('#selectFtpShot').val();
	if (!dept){
	    alert("Please select department !!!");
	    return null;
	} else if (!seq){
	    alert("Please select Sequence !!!");
	    return null;
	} else if (!shot){
	    alert("Please select shot !!!");
	    return null;
	} else if ($("#selectShotFtpDepartment").val() == 'Lighting' && !side){
	    alert("Please select side !!!");
	    return null;
	}
	for (i in shot){
	    value = shot[i];
	    shot_name = $("#selectFtpShot option[value='"+value+"']").text();
	    str_ver = proj_name+'_'+shot_name+':'+value+'|'+stat+'|'+dept+'|'+ass+'|'+ext+'|'+side;
	    data_array.push(str_ver);
	}
    }else if (obj == 'Asset Build'){
	dept = $('#selectAssetFtpDepartment').val();
	type = $('#selectFtpType').val();
	asset = $('#selectFtpAsset').val();
	if (!dept){
	    alert("Please select department !!!");
	    return null;
	} else if (!type){
	    alert("Please select Asset Type !!!");
	    return null;
	} else if (!asset){
	    alert("Please select Asset Build !!!");
	    return null;
	}
	for (i in asset){
	    value = asset[i];
	    asset_name = $("#selectFtpAsset option[value='"+value+"']").text();
	    str_ver = proj_name+'_'+asset_name+':'+value+'|'+stat+'|'+dept+'|'+ass+'|'+ext;
	    data_array.push(str_ver);
	}
    }
    load_ftp_versions(data_array);
}


function load_ftp_versions(data_array) {

    data_array = JSON.stringify(data_array);
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'data_array': data_array ,'object_name': 'FTP Versions' },
        beforeSend: function(){
            $('#panel_big').plainOverlay('show');
        },
        success: function(json){
                $.each(json, function (idx, obj) {
		    add_version_rows(idx, obj);
                });
            $('#panel_big').plainOverlay('hide');
        },
        error: function(error){
            console.log("Error:");
            console.log(error);
        }
    });
}

function add_version_rows(idx,obj){

    var obj_name = $("#selectObject").val();
    var table = $('#tbl_ftp_version tbody');
    row = $(table[0].insertRow(-1));
    ver = obj.version
//    updated_version = ver+
    camera_angle = obj.camera_angle
    ass = $('#selectFtpAssetName').val();
    obj_name = obj.obj_name
    upload_status = obj.status
    approved_version_number = obj.approved_version_number
    trimmed_version = obj.trimmed_version
    linked_path = obj.linked_path
    version_id = obj.version_id
    task_assignees = obj.assignees
    source_path = obj.source_path

    check_box = ''
    list_ver = ver.split(',')
    if (list_ver.length > 1){
	check_box = '<span id="cb'+idx+'"/>';
    }else if (upload_status == 'No version found'){
        check_box = '<span id="cb'+idx+'"/>';
    }else if (upload_status == 'Source folder not available'){
        check_box = '<span id="cb'+idx+'"/>';
    }else if (upload_status == 'Sequence version not yet approved by client'){
        check_box = '<span id="cb'+idx+'"/>';
    }else if (upload_status == "More than one version's status is Internal Approved"){
        check_box = '<span id="cb'+idx+'"/>';
    }
    else{
	check_box = '<input type="checkbox" id="cb'+idx+'" data-td-ver = "'+ver+':'+approved_version_number+':'+version_id+':'+source_path+'"/>';
    }
    version = ver.replace(/,/g, "</br>");
    if (!(upload_status == 'Ready to upload')){
        var cell = $("<td id='check_box_1'>"+check_box+"</td><td>"+obj_name+"</td><td>"+trimmed_version+"</td><td>"+approved_version_number+"<td style='color:red;'>"+upload_status+"</td><td>"+task_assignees+"</td>");
    }
    else{
        var cell = $("<td id='check_box_1'>"+check_box+"</td><td>"+obj_name+"</td><td>"+trimmed_version+"</td><td>"+approved_version_number+"<td style='color:rgb(66, 206, 82);'>"+upload_status+"</td><td>"+task_assignees+"</td>");
    }

    row.append(cell);

}

$('#upload_ftp').click(function(){
    $('#upload_ftp').prop("disabled",true);
    var ftp_version = []
    side = $('#selectFtpVersionSide').val();
    upload_status = $('#selectFtpStatus').val();
    copy_opt = 'symlink'
    dest_path = $('#dest_path').val();
    dest_path = dest_path.replace(/\s/g,'');
    var listy = []
    if (dest_path.slice(0,2) == 'Z:'){
        var dest_path_1 = dest_path.split('\\');
    }
    else {
        var dest_path_1 = dest_path.split('/');

    }

    obj = $('#selectFtpObject').val();
    var dept = '';
    if (obj == 'Shot'){
	dept = $('#selectShotFtpDepartment').val();
    }else if (obj == 'Asset Build'){
	dept = $('#selectAssetFtpDepartment').val();
    }
    $('tbody tr td input[type="checkbox"]').each(function(){
	if($(this).prop('checked')){
	    ftp_version.push($(this).attr('data-td-ver'));
	}
    });
    $('tbody tr td input[type="checkbox"]').each(function(){
	if(!($(this).prop('checked'))){
	    alert("Select files after clicking on 'Show' button")
	    return null
	}
    });
    upload_files(ftp_version,side,copy_opt,dest_path_1,upload_status,dept)

});


function upload_files(data_array,side,copy_opt,dest_path,upload_status,dept) {
    var client_final_combo = $('#selectFtpAssetName').val()
    data_dest = JSON.stringify(dest_path);
    data_array = JSON.stringify(data_array);
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'data_array': data_array ,'object_name': 'FTP Upload', 'destination':data_dest, 'prefer':copy_opt, 'side':side, 'upload_status':upload_status, 'client_final_combo': client_final_combo, 'department':dept},
        beforeSend: function(){
            $('#panel_big').plainOverlay('show');
        },
        success: function(json){
		var status_ver = '';
                $.each(json, function (idx, obj) {
		    status_ver = obj.status;
                });
            $('#panel_big').plainOverlay('hide');
                    noty({
                            text: status_ver,
                            layout: 'topCenter',
                            closeWith: ['click', 'hover'],
                            type: 'success'
			});
		setTimeout(location.reload.bind(location), 3500);
        },
        error: function(error){
            console.log("Error:");
            console.log(error);
        }
    });
    $('#upload_ftp').removeAttr("disabled");
}
$('#selectFtpStatus').change(function(){
    upload_notes()
});

function upload_notes(){

    if ($('#selectFtpStatus').val() == 'Internal'){
          $('#upload_tips').html('<span style="font-weight:bold; font-size:21px;text-decoration:underline">Status Convention to be followed-</span></br> Task status : Pending Internal Review , Version Status : Ready to review');
    }else if ($('#selectFtpAssetName').val() == 'final' && $('#selectFtpStatus').val() == 'Client') {
        $('#upload_tips').html('<span style="font-weight:bold; font-size:21px;text-decoration:underline">Status Convention to be followed-</span></br> Task status : Client Approved , Version Status : Client Approved');
    }else if ($('#selectFtpStatus').val() == 'Review'){
        $('#upload_tips').html('<span style="font-weight:bold; font-size:21px;text-decoration:underline">Status Convention to be followed-</span></br>Task status , Version Status : Client Approved');
    }else if ($('#selectFtpStatus').val() == 'DI'){
        $('#upload_tips').html('<span style="font-weight:bold; font-size:21px;text-decoration:underline">Status Convention to be followed-</span></br>Task status , Version Status : Review Approved');
    }else {
        $('#upload_tips').html('<span style="font-weight:bold; font-size:21px;text-decoration:underline">Status Convention to be followed-</span></br>Task status , Version Status : Internal Approved');
    }
}

$('#allftpcb').change(function(){
    if($(this).prop('checked')){
        $('tbody tr td input[type="checkbox"]').each(function(){
            $(this).prop('checked', true);
        });
    }else{
        $('tbody tr td input[type="checkbox"]').each(function(){
            $(this).prop('checked', false);
        });
    }
});

$('#user_reject_asset').change(function(){
    task_parent_id = $(this).attr('data-task-parent-id');
    if($(this).prop('checked')){
        select_task_elem = $('#selectVersionTask');
        select_task_elem.empty();
        select_task_elem.trigger("chosen:updated");
        $('#div_selectVersionAssetType').css({'display':'block'});
        $('#div_selectVersionAssetBuild').css({'display':'block'});
        $select_elem = $("#selectVersionAssetType");
        load_types($select_elem)
    }else{
        $('#div_selectVersionAssetType').css({'display':'none'});
        $('#div_selectVersionAssetBuild').css({'display':'none'});
        reset_model_drop_down();
	    load_choosen_data($('#div_selectVersionTask'),$('#selectVersionTask'),'Select Task',task_parent_id);
        load_choosen_data($('#div_selectTaskVersion'),$('#selectTaskVersion'),'Select Version',task_parent_id);

        select_elem = $('#selectVersionTaskAssetTypes');
        $select_elem.empty();
	    $select_elem.append('<option value="">Select Asset Type</option>');
    }

});

$('#selectVersionAssetType').change(function(){
    asset_type = $(this).val();
    if (!asset_type){
	$('#div_selectVersionAssetBuild').css({'display':'none'});
	$('#selectVersionAssetType').data("chosen").destroy().chosen();
	return null;
    }

    parent_id = $('#selectVersionAssetType').attr('data-project-id');
    if (parent_id){
	obj_name = 'RejectAsset';
	load_obj_name(obj_name, parent_id, 1);
	$('#div_selectVersionAssetBuild').css({'display':'block'});
    }
});

$('#selectVersionAssetBuild').change(function(){

    asset_id = $(this).val();
    if (asset_id){
	load_choosen_data($('#div_selectVersionTask'),$('#selectVersionTask'),'Select Task',asset_id);
    }

});

function show_model(context) {
    reset_model_drop_down();
    task_id = $(context).closest('td').attr('data-task-id');
    task_parent_id = $(context).closest('td').attr('data-task-parent-id');
    task_assignee = $(context).closest('td').attr('data-task-assignee');
    parent_object_type = $(context).closest('tr').attr('data-parent-object-type');
    project_id = $(context).closest('tr').attr('data-project-id');


    obj_name = $('#selectObject').val();

    if (obj_name){
	if (obj_name == 'Shot Asset Build'){
	    obj_name = 'Asset Build';
	}
    }else{
	obj_name = 'Task';
    }

    task = '';
    if ($('#selectTask').val()){
	task = $('#selectTask').val();
    }

    note_task = '';
    if ($('#selectNoteTask').val()){
	note_task = $('#selectNoteTask').val();
    }
    ver_note_task = '';
    if ($('#selectVersionTask').val()){
	ver_note_task = $('#selectVersionTask').val();
    }

    last_row = 15;

    load_task_details(task_id,obj_name,last_row,task_assignee);

    $('#version_note_details').html('');

    $('#note_details').html('');

    // default Task Note Tab
    load_task_notes(task_id, obj_name, last_row, note_task);

    load_choosen_data($('#div_selectVersionTask'),$('#selectVersionTask'), "Select Task", task_parent_id);
    load_choosen_data($('#div_selectNoteTask'),$('#selectNoteTask'), "Select Task", task_id);
    load_choosen_data($('#div_selectTask'),$('#selectTask'), "Select Task", task_id);

    // user_reject_asset
    $('#user_reject_asset').attr('data-task-parent-id',task_parent_id);
    $('#user_reject_asset').attr('data-project-id',project_id);
    if (parent_object_type == 'Shot'){
	$('#div_user_reject_asset').css({'display':'block'});
	$('#user_reject_asset').attr('checked',false);
	$('#selectVersionAssetType').attr('data-project-id',project_id);
    }else{
	$('#div_user_reject_asset').css({'display':'none'});
    }


    $('#btn_note_create').attr('data-task-id',task_id);

    $('#myModal').attr("obj_name", obj_name);
    $('#myModal').attr("task", task);
    $('#myModal').attr("note_task", note_task);
    $('#myModal').attr("ver_note_task", ver_note_task);

    $('#myModal').modal('show');
};
//----------- Drop down change ------------------------//
$('#selectTask').change(function(){
    task_id = $('#data-modal-object-id').val();
    obj_name = $('#myModal').attr("obj_name");
    task = $(this).val();
    last_row = 15;
    remove_rows('#tbl_versions');
    load_asset_versions(task_id,obj_name,last_row,task);
});

$('#selectNoteTask').change(function(){
    task_id = $('#data-modal-object-id').val();
    obj_name = $('#myModal').attr("obj_name");
    note_task = $(this).val();
    last_row = 15;
    $('#note_details').html('');
    load_task_notes(task_id, obj_name, last_row, note_task);
});

$('#selectVersionTask').change(function(){
    //task_id = $('#data-modal-object-id').val();
    task_id = $("#selectVersionTask option:selected").val();
    obj_name = $('#myModal').attr("obj_name");
    ver_note_task = $(this).val();
    last_row = 15;
    $('#version_note_details').html('');
    version_notes(task_id, 'Task', last_row, ver_note_task);
});

//------------- Scroll calls----------------//

$('#note_details').on('scroll', function() {
	$('#user_reject_asset').attr('data-task-parent-id',task_parent_id);
    task_id = $('#data-modal-object-id').val();
    obj_name = $('#myModal').attr("obj_name");
    if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
    last_row += 15
    if (note_task != $('#selectNoteTask').val()){
    note_task = $('#selectNoteTask').val();
    last_row = 15;
    $('#note_details').html('');
    }
        load_task_notes(task_id, obj_name, last_row, note_task);
    }
});

$('#version_details').on('scroll', function() {
    task_id = $('#data-modal-object-id').val();
    obj_name = $('#myModal').attr("obj_name");
    if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
    last_row += 15;
    if (task && task != $('#selectTask').val()){
    task = $('#selectTask').val();
    last_row = 15;
    remove_rows('#tbl_versions');
    }
        load_asset_versions(task_id,obj_name,last_row,task);
    }
});

$('#version_note_details').on('scroll', function() {
    task_id = $('#data-modal-object-id').val();
    obj_name = $('#myModal').attr("obj_name");
    if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
    last_row += 15;
    if (ver_note_task && ver_note_task != $('#selectVersionTask').val()){
        ver_note_task = $('#selectVersionTask').val();
        last_row = 15;
        $('#version_note_details').html('');
    }
        version_notes(task_id,obj_name,last_row,ver_note_task);
    }
});


//------------- tabs change calls --------------------------//
//

    // tab-1
$('#my_not').on('click', function() {
    task_id = $('#data-modal-object-id').val();
    obj_name = $('#myModal').attr("obj_name");
    note_task = $('#myModal').attr("note_task");
    last_row = 15;
    $('#note_details').html('');
    load_task_notes(task_id, obj_name, last_row, note_task);
    $('#btn_note_create').attr('data-task-id',task_id);
});

    // tab-2
$('#my_lnk').on('click', function() {
    task_id = $('#data-modal-object-id').val();
    obj_name = $('#myModal').attr("obj_name");
    last_row = 15;
    $('#link_details').html('');
    load_task_links(task_id,obj_name,last_row)

});

    // tab-3
 $('#my_vsn').on('click', function() {
    task_id = $('#data-modal-object-id').val();
    obj_name = $('#myModal').attr("obj_name");
    task = $('#myModal').attr("task");
    last_row = 15;
    $('#tbl_versions tbody').html('');
    $('#gallery_versions tbody').html('');
    $('#gallery_notes tbody').html('');
    load_asset_versions(task_id,obj_name,last_row,task);
});

 // tab-4
$('#my_vsn_not').on('click', function() {
    task_id = $('#data-modal-object-id').val();
    obj_name = $('#myModal').attr("obj_name");
    ver_note_task = $('#myModal').attr("ver_note_task");
    last_row = 15;
    $('#note_attach').val('');
    $('#version_note_details').html('');
    version_notes(task_id,obj_name,last_row,ver_note_task);
});


//----------- close model ---------------//
$('#myReset').on('click', function() {
        $('#myModal').hide("");
        $('#modal_header').html('');
        $('#selectVersionTask').html('');
        $('#selectNoteTask').html('');

        $('.nav-tabs li.active').removeClass('active');
        $('.nav-tabs li a[href="#my_notes"]').tab('show')
    });

//------------ show likModel ---------------//
function show_link_model(param){
    $('#myInput').val('');
    var prj_name = $("#selectProject option:selected").text();
    var proj_id = $("#selectProject option:selected").val();
    asset_list = get_asset_list(proj_id, prj_name)
    $('#linkModel').modal('show');

};

//--------- get asset list ------------------//
function get_asset_list(proj_id, prj_name){
    var asset_ids = ($('#link_details').attr('asset_ids')).split(",");
    var asset_array = asset_ids.join();

    $('#myList').html('');

    checked_list = [];
    unchecked_list = [];

    $.ajax({
	type: "POST",
	url:"/callajax/",
	data: { 'object_name': 'Asset Build' , 'prj_name': prj_name, 'proj_id': proj_id},
	success: function(json){
	$.each(json, function (idx, obj) {
	    obj_dict = {};
	    if(jQuery.inArray(obj.id, asset_ids) !== -1){
	    checked_list.push('<li class="list-group-item"><input type="checkbox" name="asset" value="'+obj.id+'" checked/>&nbsp;'+obj.name+'</li>')
	    }
	    else{
	      unchecked_list.push('<li class="list-group-item"><input type="checkbox" name="asset" value="'+obj.id+'"/>&nbsp;'+obj.name+'</li>')
	    }
	});
	checked_list.push(unchecked_list);
	for (i = 0; i < checked_list.length; i++) {
     $('#myList').append(checked_list[i]);
    }

	$("#linktask_details_loader").hide();
	},
	error: function(error){
	    console.log("Error:");
	    console.log(error);
	}
    });
}

//-------- add asset ------------------- //
function add_asset(param){
    $("#linktask_details_loader").show();

    var task_id = $('#data-modal-object-id').val()
    var obj_name = $('#selectObject').val();

    if (obj_name){
	if (obj_name == 'Shot Asset Build'){
	    obj_name = 'Asset Build';
	}
    }else{
	obj_name = 'Task';
    }
    var asset_name = $('#selectObject option:selected').val();
    var old_asset_ids = ($('#link_details').attr('asset_ids')).split(",");
    var selected_asset = [];

    $.each($("input[name='asset']:checked"), function(){
        selected_asset.push($(this).val());
    });

    //call
    $.ajax({
	type: "POST",
	url:"/callajax/",
	data: { 'object_name': 'Link Asset' , 'task_id': task_id, 'selected_asset': selected_asset.join(), 'asset_name': asset_name, 'old_asset_ids': old_asset_ids.join()},
	success: function(json){
	    $("#linktask_details_loader").hide();
	    // Reload task links
        load_task_links(task_id,obj_name,15);
	},
	error: function(error){
	    console.log("Error:");
	    console.log(error);
	}

    });
    $('#linkModel').modal('hide');
}


//----------- for filter asset list ----------//
$(document).ready(function(){
  $("#myInput").on("keyup", function() {
    var value = $(this).val().toLowerCase();
    $("#myList li").filter(function() {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
    });
  });
});


function reset_model_drop_down(){

    $('#selectVersionTask').val('').trigger("liszt:updated").trigger("chosen:updated");
    $('#selectVersionTaskAssetTypes').val('').trigger("liszt:updated").trigger("chosen:updated");
    $('#selectTaskVersion').val('').trigger("liszt:updated").trigger("chosen:updated");
    $('#selectVersionNoteCategory').val('').trigger("liszt:updated").trigger("chosen:updated");
    $('#selectTask').val('').trigger("liszt:updated").trigger("chosen:updated");
    $('#selectAssetTypes').val('').trigger("liszt:updated").trigger("chosen:updated");
    $('#selectNoteTask').val('').trigger("liszt:updated").trigger("chosen:updated");
    $('#selectNoteCategory').val('').trigger("liszt:updated").trigger("chosen:updated");
    $('#selectVersionAssetBuild').val('').trigger("liszt:updated").trigger("chosen:updated");

    $('#div_selectVersionAssetType').css({'display':'none'});
    $('#div_selectVersionAssetBuild').css({'display':'none'});

    $('#note_details').html('');
    $('#version_note_details').html('');

}

function load_task_details(task_id,obj_name,last_row,task_assignee){
    $("#task_details_loader").show();
    $.ajax({
	type: "POST",
	url:"/callajax/",
	data: { 'task_id': task_id , 'type_name': obj_name, 'object_name': 'Show Task Details' , 'last_row' : last_row, 'task_assignee': task_assignee},
	success: function(json){
	$.each(json, function (idx, obj) {
	    add_task_details(idx, obj);
	});
	$("#task_details_loader").hide();
	},
	error: function(error){
	    console.log("Error:");
	    console.log(error);
	}
    });
}

function add_task_details(idx, obj){
    var path = obj.link_path
    var task_parent_path = path.substring(0, path.lastIndexOf('/'));

    html = '<input type="hidden" id="data-modal-object-id" data-modal-parent-id="'+obj.parent_id+'" task_assignee="'+task_assignee+'" task_parent_path="'+task_parent_path+'" value="'+obj.object_id+'" /><h3>'+obj.name+'</h3><label>'+obj.object_type+' ('+obj.type_name+')</label></br><small id="from-id">'+obj.link_path+'</small>';

    status_label = obj.status.replace(/ /g,'_').toLowerCase();
    priority_label = obj.priority.replace(/ /g,'_');

    status_span = '<span class="label label-'+status_label+'">'+obj.status+'</span>'
    priority_span = '<span class="label label-'+priority_label+'">'+obj.priority+'</span>'

    table = ' \
<div class="col-md-12">\
    <div class="col-md-4">'+html+'</div>\
    <div class="col-md-4"><br>\
        <table>\
            <tr><td><label>Status</label></td><td>'+status_span+'</td></tr>\
            <tr><td><label>Priority</label></td><td>'+priority_span+'</td></tr>\
        </table>\
    </div>\
</div>\
';
    $('#modal_header').html(table);

/*
    //for asset_task list

    $select_elem = $('#selectVersionTask');
    $select_elem.empty();
    $select_elem.append('<option value="">Select Task</option>');
    $.each(obj.asset_task_dict, function (task_id,task_name) {
		$select_elem.append('<option value="'+task_name+'" data-id="'+task_id +'">'+task_name+'</option>');
            });
	    $select_elem.trigger("chosen:updated");
	    $select_elem.trigger("liszt:updated");
	    //$select_elem.data("chosen").destroy().chosen();


    $select_elem_notes = $('#selectNoteTask');
    $select_elem_notes.empty();
    $select_elem_notes.append('<option value="">None</option>');
    $.each(obj.asset_task_dict, function (task_id,task_name) {
		$select_elem_notes.append('<option value="'+task_name+'" data-id="'+task_id +'">'+task_name+'</option>');
            });
	    $select_elem_notes.trigger("chosen:updated");
	    $select_elem_notes.trigger("liszt:updated");

*/
}

function load_task_notes(task_id, obj_name, last_row, note_task){
    $("#task_notes_loader").show();
    $.ajax({
	type: "POST",
	url:"/callajax/",
	data: { 'task_id': task_id , 'type_name': obj_name, 'object_name': 'Show Note Details' , 'last_row' : last_row, 'note_task': note_task},
	success: function(json){
	$.each(json, function (idx, obj) {
	    modal_body = add_note_details(idx, obj);
	    $('#note_details').append(modal_body);
	});
	$("#task_notes_loader").hide();
	toggle_asset_type($('#selectAssetTypes'));
	},
	error: function(error){
	    console.log("Error:");
	    console.log(error);
	}
    });
}

$('#btn_note_create').click(function(){
    
    task_id = $(this).attr('data-task-id');
    if(task_id){
	create_a_note(task_id);
    }

});


function create_a_note(task_id){

    $textarea_id = $('#text_artist_note');
    var note_text = $textarea_id.val().trim();
    var note_category = $('#selectNoteCategory').val();
    if (!(note_text.length && task_id)){
	alert("invalid note ...");
	return null;
    }
    if (!(note_category)){
	alert("Please select valid category ...");
	return null;
    }

    obj_name = $('#selectObject').val();
    if (obj_name){
        if (obj_name == 'Shot Asset Build'){
            obj_name = 'Asset Build';
        }
    }else{
        obj_name = 'Task';
    }

    attachments = [];
    $textarea_id.parent().find('table[id=gallery_notes] tr td a').each(function(){
	href = $(this).attr('href');
	attachments.push(href);
    });

    attach_files = JSON.stringify(attachments);
    note_task = $('#selectNoteTask').val();

    note_for = obj_name;
    $div_element = $('#note_details');
    create_new_note(task_id, note_text, note_category, note_for, $div_element, $textarea_id, note_task, attach_files, obj_name);
    $textarea_id.parent().find('table[id=gallery_notes] tbody').html('');

}

function create_new_note(task_id, note_text, note_category, note_for, $div_element, $textarea_id, note_task, attach_files, obj_name){
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'object_name': 'Create Note', 'task_id': task_id, 'note_text': note_text, 'note_category': note_category, 'note_for': note_for, 'note_task': note_task, "attach_files": attach_files},
        beforeSend: function(){
        },
        success: function(json){
            add_note_div(json["note_id"], task_id, obj_name, note_text, note_category);
            noty({
                text: 'Note added successfully ...',
                layout: 'topCenter',
                closeWith: ['click', 'hover'],
                type: 'success'
            });
        },
        error: function(error){
            console.log("Error:");
            console.log(error);
        }
    });
}

function add_note_div(note_id,task_id, obj_name, note_text, note_category){
    var del_var = '';
    del_var = '<button class="btn btn-xs btn-danger" style="float\:right;" id="delete-note" onclick="delete_note(this)"\
    task-id="'+task_id+'" obj-name="'+obj_name+' "note-id="'+note_id+'">Delete</button>'

    $textarea_id.val('');
    note_author = $div_element.attr('data-user-id').toLowerCase();
    note_date = new Date().toLocaleFormat('%F %T');
    note_head = note_text;
//    note_category = 'Internal'
    my_note = '\
    <div class="box row" id="category-'+note_category+'"> \
        <span class="label label-info">'+note_author+'</span>\
        <span class="label label-'+note_category+'" style="width\:62%">'+note_category+'</span> \
        <span class="label label-info" style="float\:right;">'+note_date+'</span>\
        <p>'+note_head+'</p>\
        <div class="box row"><strong>'+note_info+'</strong><button class="btn btn-xs btn-primary" style="float\:right;">'+ note_author +'</button>'+del_var+'</div>\
        '+reply+'\
        '+do_reply+'\
    </div>\
    ';
    $div_element.prepend(my_note);

}



function reply_to_note(my_note_id){

    $textarea_id = $('#text_artist_note-'+my_note_id);
    var reply_text = $textarea_id.val().trim();
    if (!(reply_text.length && my_note_id)){
	alert("invalid note ...");
	return null;
    }

    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'object_name': 'Reply Note', 'note_id': my_note_id, 'reply_text': reply_text},
        beforeSend: function(){
        },
        success: function(json){
            $.each(json, function (idx, obj) {
            });

            noty({
                text: 'Reply done ...',
                layout: 'topCenter',
                closeWith: ['click', 'hover'],
                type: 'success'
            });
        },
        error: function(error){
            console.log("Error:");
            console.log(error);
        }
    });
    $textarea_id.val('');
    user = $('#note_details').attr('data-user-id').toLowerCase();
    current_date = new Date().toLocaleFormat('%F %T');
    my_reply = '<p>'+user+' :- '+reply_text+'<span class="label" style="float:right;">'+current_date+'</span></p>';
    $('#note_replies-'+my_note_id).append(my_reply);

}
function popup_video(param){
	$('#myModal').modal('hide');
        $(param).popVideo({
            playOnOpen: true,
            title: "",
          closeOnEnd: false,
            pauseOnClose: true,
        }).open()
}


function popup_image(param){

$(param).ekkoLightbox();

}

function add_note_details(idx, obj){
    note_author = obj.note_author;
    note_id = obj.note_id;
    note_category = obj.note_category;
    note_date = obj.note_date;
    note_head = obj.note_head;
    note_head = note_head.replace(/\n/g,'</br>');
    task_name = obj.task_name;
    current_user = obj.current_user
    note_info = obj.note_info;

    if (obj.note_components.length > 0){
	component = '';
	for (k in obj.note_components){
	    my_url = obj.note_components[k].url;
	    file_type = obj.note_components[k].file_type;
	    if (file_type == '.mov'){
		// component = component + '&nbsp; <video src="'+my_url+'" webkit-playsinline playsinline data-video="'+my_url+'" loop muted autoplay id="note_video" class="video" height="80" onclick="popup_video(this)">\
        // </video> ';
        component = component + '&nbsp; <br><br><div id="'+my_url+'" class="light_video_box"><a class="boxclose" id="boxclose" onclick="light_video_box_close(this);"></a><video width="600" controls><source src="'+my_url+'"  type="video/mp4" "></video></div><video src="'+my_url+'" webkit-playsinline playsinline data-video="'+my_url+'" loop muted autoplay  class="video" height="80" onclick="light_video_box_open(this)"/>';

	    }else{
		component = component + '&nbsp; <div id="'+my_url+'" class="light_image_box"><a class="boxclose" id="boxclose" onclick="light_image_box_close(this);"></a><img src="'+my_url+'" height="100%" width="100%"></div><img src="'+my_url+'" height="80" width="auto" onclick="light_image_box_open(this)">';
	    }
	}
	note_head = note_head + '<br>' + component;
    }

    reply = '';
    if (obj.replies.length > 0){
	reply = '';
	for (j in obj.replies){
	    my_reply = obj.replies[j];
	    r_array = my_reply.split('||');
	    reply = reply + '<p>'+r_array[0]+'<span class="label" style="float:right;">'+r_array[1]+'</span></p>';
	}
    }

    do_reply = '\
                                            <table> \
                                                <tr> \
                                                    <td style="width: 100%;"> \
                                                        <textarea id="text_artist_note-'+note_id+'" rows="4" cols="20" placeholder="Write a comment..." class="x-form-field x-form-text x-form-textarea" autocomplete="off" style="width: 100%; height: 48px;"></textarea> \
                                                    </td> \
                                                    <td> \
                                        <button class="btn btn-inverse btn-default btn-lg" id="btn_note_reply" onclick="reply_to_note(\''+note_id+'\')" style="width: 60px;"> \
                        <i class="glyphicon glyphicon-send icon-white"></i></button> \
                                                    </td> \
                                                </tr> \
                                            </table> \
';

    if (note_category != 'Internal'){
	do_reply = '';
    }
    if (reply){
	reply = '\
	    <div class="box row" id="note_replies-'+note_id+'"> \
	    '+reply+'\
	    </div> \
	';
    }

    style = 'style="width:81%"';
    if (task_name){
	style = 'style="width:61%"';
    }

    var del_var = '';
    if(note_author == current_user){
        del_var = '<button class="btn btn-xs btn-danger" style="float\:right;" id="delete-note" onclick="delete_note(this)"\
         task-id="'+task_id+'" obj-name="'+obj_name+' "note-id="'+note_id+'">Delete</button>'
    }

    modal_body = '\
	<div class="box row" id="'+note_id+'" > \
	    <span class="label label-info" >'+task_name+'</span>\
	    <span class="label label-'+note_category+'" '+style+'>'+note_category+'</span> \
	    <span class="label label-info" style="float\:right;">'+note_date+'</span>\
	    <p>'+note_head+'</p>\
	    <div class="box row"><strong>'+note_info+'</strong><button class="btn btn-xs btn-primary" style="float\:right;">'+ note_author +'</button>'+del_var+'</div>\
	    '+reply+'\
	    '+do_reply+'\
	</div>\
    ';

    return modal_body;
}


//------ delete note -----------------//
function delete_note(param){
    id = $(param).parent().parent().attr('id');
    var cnf = confirm("Are you sure. You want to delete this note!");
    if (cnf == true) {
        var note_id = id;
        var task_id = $('#data-modal-object-id').val()
        var obj_name = $('#selectObject').val();

        if (obj_name){
            if (obj_name == 'Shot Asset Build'){
                obj_name = 'Asset Build';
            }
        }else{
            obj_name = 'Task';
        }
        // call ajax
        $.ajax({
        type: "POST",
        url:"/callajax/",
        data: { 'object_name': 'Delete Note' ,'note_id': note_id},
        success: function(){
            $("#" +note_id).hide();
            noty({
                text: 'Note deleted successfully ...',
                layout: 'topCenter',
                closeWith: ['click', 'hover'],
                type: 'success'
            });
        },
        error: function(error){
	    console.log("Error:");
	    console.log(error);
	    }

        });
    }
}


function load_task_links(task_id,obj_name,last_row){
    $("#task_link_loader").show();
    body_row_array = []
    asset_ids_array = []
    $.ajax({
	type: "POST",
	url:"/callajax/",
	data: { 'task_id': task_id , 'type_name': obj_name, 'object_name': 'Show Link Details' , 'last_row' : last_row},
	beforeSend: function(){
	    $('#link_details').html(" ");
	    },
	success: function(json){
	$.each(json, function (idx, obj) {
	    body_row = add_link_details(idx, obj);
	    body_row_array.push(body_row);
	    asset_ids_array.push(obj.id)
	});
	$("#task_link_loader").hide();
	$('#link_details').attr('asset_ids', asset_ids_array)
	$('#link_details').html('<div class="panel-group" id="link_accordion">'+body_row_array.join('')+'</div>');
	},
	error: function(error){
	    console.log("Error:");
	    console.log(error);
	}
    });
}

function add_link_details(idx, obj){
    link = '<span class="label label-None" style="width:100%">'+obj.name+'</label>';
    body_row = '\
	<div class="panel panel-default" id="link_category-'+idx+'">\
            <div class="panel-heading">\
                <a data-toggle="collapse" data-parent="#link_accordion" href="#link_collapse1-'+idx+'" style="text-decoration: none;">'+link+'</a>\
            </div>\
	    <div id="link_collapse1-'+idx+'" class="panel-collapse collapse">\
	    </div>\
	</div>\
    ';
    return body_row;
}

function load_asset_versions(task_id,obj_name,last_row,task){
    $("#version_loader").show();
    $.ajax({
	type: "POST",
	url:"/callajax/",
	data: { 'task_id': task_id , 'type_name': obj_name, 'object_name': 'Show Asset Versions' , 'last_row' : last_row, 'task': task},
	success: function(json){
	    $.each(json, function (idx, obj) {
		add_version_details(idx, obj);
	   });
	    $("#version_loader").hide();
	    toggle_asset_type($('#selectAssetTypes'));
	},
	error: function(error){
	    console.log("Error:");
	    console.log(error);
	}
    });
}

function add_version_details(idx, obj){

    var table = $('#tbl_versions tbody');
    add_version_row(table,obj)
}

function add_version_row(table,obj){

    label_status = obj.status_name.replace(/ /g,"_").toLowerCase();
    asset_type = obj.asset_type.replace(/ /g,"_").toLowerCase();
    row = $(table[0].insertRow(-1));
    row.attr('id','asset_type-'+asset_type)

    enable_dblclick = ''
    if (obj.user_role == 'Supervisor' || obj.user_role == 'Co-ordinator'){
	enable_dblclick = 'ondblclick="editCell(this)"'
    }

    row_data = '\
	  <td>'+obj.version_name+'</td> \
	  <td class="center">'+obj.asset_type+'</td> \
	  <td table-type="versions" data-org-val="'+obj.status_name+'" data-version-id="'+obj.version_id+'" data-id="show_status" '+enable_dblclick+'>\
	    <span class="label label-'+label_status+'">'+obj.status_name+'</span></td>\
	  <td class="center" style="width: 207px;">'+obj.published_on+'</td> \
	  <td class="center">'+obj.published_by+'</td></td><td>'+obj.comment+'</td> \
	'
	row.append(row_data);
    $(row).click(function(event){
        if(event.ctrlKey === true) {
            $(this).toggleClass("selected")
        }
    });
}

function toggle_parent_note(param) {
//    id = $(param).find('option:selected').attr('id');
    category = $(param).val();
    category = category.replace(/ /g,"_");
//    cat_id = "category-"+category+"-"+id
    cat_id = "category-"+category
    all_cat_id = "category-"
    $('[id="'+cat_id+'"]').css({'display':'block'});
    $('[id^="'+all_cat_id+'"]').each(function(index){
        this_id = $(this).attr('id')
//        var patt = new RegExp(cat_id);
//        var match = patt.test(this_id);
        if(cat_id == all_cat_id){
            $(this).css({"display":"block"});
        }else if (this_id != cat_id){
            $(this).css({"display":"none"});
	}

    })
}

function toggle_asset_type(param) {
    _this = param
    $.each($("#tbl_versions tbody tr"), function(idx) {
        if($(this).text().toLowerCase().indexOf($(_this).val().toLowerCase()) === -1)
            $(this).hide();
        else
            $(this).show();
        });
}

$('#tab_shot_reports').click(function(){
    $('#download_user_task').attr("onclick","$('#tbl_shot_task').table2excel({filename: 'artist_prod_shot',exclude: '.noExl'});");
});

$('#tab_asset_build_reports').click(function(){
    $('#download_user_task').attr("onclick","$('#tbl_asset_build_task').table2excel({filename: 'asset_build_prod_shot',exclude: '.noExl'});");
});

$('#download_task_status').click(function(){
    $("#tbl_task").table2excel({
	exclude: ".noExl",
	name: "TaskReports",
	filename: "task_reports.xls"
    });
});

function insert_db_note(note_text, note_category, object_id, change_status, users, task_path, version){

    var from = $('#from-id').text();
    var to = task_path;

    if (!from){
	from = task_path;
    }else{
	from = from.replace(/\s/g, "").replace(/\//g, ':');
    }

    $.ajax({
	type: "POST",
	url: "/callajax/",
	data: {"object_name": "DB Note", "note_text": note_text, "note_category": note_category, "task_id": object_id, "users": users, "task_path": task_path, "change_status": change_status, "version":version, "from": from, "to": to},
	success: function(json){
	},
	error: function(error){
	    console.log("Error:"+error);
	}
    });

}
function add_task_note(note, note_category, object_id, note_for, attach_files){
    $.ajax({
	type: "POST",
	url: "/callajax/",
	data: {"object_name": "Create Note", "note_text": note, "note_category": note_category, "task_id": object_id, "note_for": note_for, "attach_files": attach_files},
	success: function(json){
	    noty({
                text: 'Note added successfully ...',
                layout: 'topCenter',
                closeWith: ['click', 'hover'],
                type: 'success'
            });
	},
	error: function(error){
	    console.log("Error:"+error);
	}
    });
}

function object_status_change(new_status, old_status, object_id, status_for){

    $.ajax({
	type: "POST",
	url: "/callajax/",
	data: {"object_name": "Change Status", "new_status": new_status, "old_status": old_status, "object_id": object_id, "status_for": status_for},
	success: function(json){
	    noty({
                text: 'Status has been changed ...',
                layout: 'topCenter',
                closeWith: ['click', 'hover'],
                type: 'success'
            });
	},
	error: function(error){
	    console.log("Error:"+error);
	}
    });

}

function attach_media_files(param){
    $("#fileupload").click();

$("#fileupload").fileupload({
    dataType: 'json',
    sequentialUploads: true,
    url: '/callajax/',

    start: function (e) {
      $(".progress").css({"display":"block"});
    },

    stop: function (e) {
      $(".progress-bar").css({"width": "0%"});
      $(".progress-bar").text("0%");
      $(".progress").css({"display":"none"});
    },

    progressall: function (e, data) {
      var progress = parseInt(data.loaded / data.total * 100, 10);
      var strProgress = progress + "%";
      $(".progress-bar").css({"width": strProgress});
      $(".progress-bar").text(strProgress);
    },

    done: function (e, data) {
      if (data.result.is_valid) {
	my_gallery = $(param).attr('data-gallery');
	if (!my_gallery){
	    my_gallery = 'gallery';
	}
        $("#"+my_gallery+" tbody").append(
          "<tr><td style='text-align:left'><a href='" + data.result.url + "'>" + data.result.name + "</a></td><td style='width: 10%;'><button type='button' class='btn btn-inverse btn-default btn-xs' onclick='$(this).parent().parent().remove()'><span class='glyphicon glyphicon-remove'></span></button></td></tr>");
      }
    }

  });
}

function approve_task(param){
    $tr = $(param).closest('tr');
    $td_status = $tr.find('td[data-td=status]');
    my_status = $td_status.attr('data-org-val');

    $td_date = $tr.find('td[data-td=modified_date]');

    $td_users = $tr.find('td[data-td=users]');
    var users = $td_users.text().trim();

    $td_task_path = $tr.find('td[data-td=task_path]');
    var task_path = $td_task_path.text().trim();

    $td_version = $tr.find('td[data-td=version]');
    var version = $td_version.text();

    object_id = $tr.attr('data-task-id');
    version_id = $tr.attr('data-version-id');
    object_type = $tr.attr('data-object-type');

    change_status = '';
    change_status_label = '';
    note_category = '';

    if (my_status == 'Pending Client Review'){
	change_status = 'Client Approved';
	change_status_label = 'client_approved';
	note_category = 'Client feedback';
    }else if (my_status == 'Pending Internal Review'){
	change_status = 'Ready to Publish';
    change_status_label = 'ready_to_publish';
    version_id = '';
    note_category = 'Internal';
    }

    /*if (object_id){
    // changing status here
	object_status_change(change_status, my_status ,object_id, 'Task');

	if (version_id){
	    object_status_change(change_status, my_status ,version_id, 'AssetVersion');
	}

	$td_status.html('<span class="label label-'+change_status_label+'">'+change_status+'</span>');
	$td_status.attr('data-org-val',change_status);

	my_date = new Date().toLocaleFormat('%F %T');
	$td_date.html('<strong>'+my_date+'</strong>');

	$(param).css({'display':'none'});
	$(param).parent().find('[id=task_reject]').css({'display':'none'});
    }*/

    $('#task_reject_note').val('');
    $('#gallery tbody').html('');
    $('#task_details_loader').html('<h3>Approve Note</h3>')
    var $newModal = $("#myModal").clone();
    $newModal.modal('show');

    $newModal.on('click', '#btn_note_reject', function(e){
        e.preventDefault();

        var note_text = $(this).parent().find('textarea[id=task_reject_note]').val().trim();
        if (!(note_text.length && object_id)){
            alert("invalid note ...");
            return null;
        }

        var attachments = [];
        $(this).parent().find('table[id=gallery] tr td a').each(function(){
            href = $(this).attr('href');
            attachments.push(href);
        });

        attach_files = JSON.stringify(attachments);
        if (object_id){
            // changing status here
            object_status_change(change_status, my_status , object_id, 'Task');
            add_task_note(note_text, note_category, object_id, 'Task', attach_files);

            if (version_id && version_id != 'undefined'){
                object_status_change(change_status, my_status ,version_id, 'AssetVersion');
                add_task_note(note_text, note_category, version_id, 'AssetVersion', attach_files);
            }

            insert_db_note(note_text, note_category, object_id, change_status, users, task_path, version);

            $td_status.html('<span class="label label-'+change_status_label+'">'+change_status+'</span>');
            $td_status.attr('data-org-val',change_status);

            my_date = new Date().toLocaleFormat('%F %T');
            $td_date.html('<strong>'+my_date+'</strong>');

            $(param).css({'display':'none'});
            $(param).parent().find('[id=task_reject]').css({'display':'none'});
        }
        $newModal.modal('hide');
    });
}

function reject_task(param){
    $tr = $(param).closest('tr');
    $td_status = $tr.find('td[data-td=status]');
    my_status = $td_status.attr('data-org-val');

    $td_date = $tr.find('td[data-td=modified_date]');

    $td_users = $tr.find('td[data-td=users]');
    var users = $td_users.text().trim();

    $td_task_path = $tr.find('td[data-td=task_path]');
    var task_path = $td_task_path.text().trim();

    $td_version = $tr.find('td[data-td=version]');
    var version = $td_version.text();

    object_id = $tr.attr('data-task-id');
    version_id = $tr.attr('data-version-id');
    object_type = $tr.attr('data-object-type');

    change_status = '';
    change_status_label = '';
    note_category = '';

    if (my_status == 'Pending Client Review'){
	change_status = 'Client Reject';
	change_status_label = 'client_reject';
	note_category = 'Client feedback';
    }else if (my_status == 'Pending Internal Review'){
	change_status = 'Internal Reject';
	change_status_label = 'internal_reject';
	note_category = 'Internal';
    }

    $('#task_reject_note').val('');
    $('#gallery tbody').html('');
    $('#task_details_loader').html('<h3>Reject Note</h3>')
    var $newModal = $("#myModal").clone();
    $newModal.modal('show');

    $newModal.on('click', '#btn_note_reject', function(e){
	e.preventDefault();

	var note_text = $(this).parent().find('textarea[id=task_reject_note]').val().trim();
	if (!(note_text.length && object_id)){
	    alert("invalid note ...");
	    return null;
	}

	var attachments = [];
	$(this).parent().find('table[id=gallery] tr td a').each(function(){
	    href = $(this).attr('href');
	    attachments.push(href);
	});

	attach_files = JSON.stringify(attachments);

	object_status_change(change_status, my_status , object_id, 'Task');
	add_task_note(note_text, note_category, object_id, 'Task', attach_files);

	if (version_id && version_id != 'undefined'){
	    object_status_change(change_status, my_status , version_id, 'AssetVersion');
	    add_task_note(note_text, note_category, version_id, 'AssetVersion', attach_files);
	}

	insert_db_note(note_text, note_category, object_id, change_status, users, task_path, version);

	$td_status.html('<span class="label label-'+change_status_label+'">'+change_status+'</span>');
	$td_status.attr('data-org-val',change_status);

	my_date = new Date().toLocaleFormat('%F %T');
	$td_date.html('<strong>'+my_date+'</strong>');

	$(param).css({'display':'none'});
	$(param).parent().find('[id=task_approved]').css({'display':'none'});

	$newModal.modal('hide');
    });

}
// Function for internal rejection
function internal_reject_task(version_id, note_text, note_category, note_for, note_task, attach_files){
    var users = $('#data-modal-object-id').attr('task_assignee');
    var task_name = $("#selectVersionTask option:selected").text();
    var object_id = $("#selectVersionTask option:selected").val();
//    var selected = $('#selectVersionTask').find('option:selected');
//    var object_id = selected.data('id');
    var task_parent_path = $('#data-modal-object-id').attr('task_parent_path');
    var task_path = $("#selectVersionTask option:selected").attr('data-path'); // task_parent_path.replace(/\s/g, "").replace(/\//g, ':') + ":" + String(task_name)
    var version = $("#selectTaskVersion option[value='"+ version_id +"']").text(); //$('#selectTaskVersion:selected').text();
    var my_status = 'Pending Internal Review';
	var change_status = 'Internal Reject';
	var change_status_label = 'internal_reject';
	var note_category = 'Internal';
 	var note_text = note_text; //$(this).parent().find('textarea[id=task_reject_note]').val().trim();

    object_status_change(change_status, my_status , object_id, 'Task');

	if (version_id){
	    object_status_change(change_status, my_status , version_id, 'AssetVersion');
	}

    insert_db_note(note_text, note_category, object_id, change_status, users, task_path, version);
}

//
$('#selectMGMDashProject').change(function(){
    mgm_dashboard();

});

$('#selectMonthDuration').change(function(){
    month_wise_reports();

});

$('#selectMonthProject').change(function(){
    month_wise_reports();

});

function create_table_row(duration){

    $("#tbl_asset_build").html('');
  

    months = []
    for ( i=0 ; i<duration; i++){
	month = moment().subtract(i, 'month').format('MMM-YYYY');
	months.push(month)
    }
   
    thead = '<thead><tr><th rowspan="2"><h4>TASK</h4></th><th colspan="2">Asset Build</th>';

    th_row1 = '';
    th_row2 = '<th>Type</th><th>Done</th>';

//    months = months.reverse();

    for (j in months){
	th_row1 = th_row1 + '<th colspan="5">'+months[j]+'</th>';
	th_row2 = th_row2 + '<th>Count</th><th>WIP</th><th>Internal</th><th>Client</th><th>Approved</th>';
    }

    thead = thead + th_row1 + '</tr>' + '<tr>' + th_row2 + '</tr>';
    tbody = '<tbody></tbody>';

    $("#tbl_asset_build").html(thead + tbody);

    return months
	
}

function month_wise_reports(){

    project_id = $('#selectMonthProject').val();
    if(!project_id){
	alert("Please select valid project !!!");
    }

    project = $("#selectMonthProject option[value='"+project_id+"']").text(); 


    duration = $("#selectMonthDuration").val();

    months = create_table_row(duration);

    json_months = JSON.stringify(months)

    start = moment().subtract(duration-1, 'months').startOf('month').format('YYYY-MM-DD');  
    end = moment().endOf('month').format('YYYY-MM-DD');

    parent_object_type = 'Asset Build'

    $.ajax({
	type: "POST",
	url: "/callajax/",
	data : {'object_name': 'Month Wise Reports', 'project': project, 'start_date': start, 'end_date': end, 'parent_object_type': parent_object_type, 'months': json_months},
	beforeSend: function(){
        },
	success: function(json){
	    $.each(json,function(idx,obj){

//		var users_data = obj.user_count;
//		show_total_users(users_data);
	
//		var sequence_data = obj.sequence;
//		create_sequence_table(sequence_data);
		
		var asset_build_data = obj.asset_build;
		asset_build_monthly_reports(asset_build_data, months);
	    });	    
	},
	error: function(error){
	    console.log("Error:"+error);
	}

    });
}
function asset_build_monthly_reports(data, months){

    $.each(data, function(task,task_data){

	task_name = '<td rowspan="3"><h3>'+task+'</h3></td>';
	char_data = '';
	prop_data = '';
	set_data = '';
	total_data = '';	

	if (task_data && task_data['Character']){
	    char_data = '<td>Character</td><td>'+task_data['Character']['Percent']+'%</td>';
	}else{
	    char_data = '<td>Character</td><td>0%</td>';
	}
	if (task_data['Prop']){
	    prop_data = '<td>Prop</td><td>'+task_data['Prop']['Percent']+'%</td>';
	}else{
	    prop_data = '<td>Prop</td><td>0%</td>';
	}
	if (task_data['Set']){
	    set_data = '<td>Set</td><td>'+task_data['Set']['Percent']+'%</td>';
	}else{
	    set_data = '<td>Set</td><td>0%</td>';
	}
	if (task_data['Total']){
	    total_data = '<td><strong style="color: #58fffc;">Total</strong></td><td><strong style="color: #58fffc;">'+task_data['Total']+'</strong></td><td><strong style="color: #58fffc;">'+task_data['Percent']+'%</strong></td>';
	}
	$.each($("#tbl_asset_build tr:eq(0) th"), function(idx) {
	    if (idx <= 1)
		return;

	    head = $(this).text();
	    tasks = '';
	    if (task_data[head] && task_data[head]['Task']){
		tasks = task_data[head]['Task'];
	    }

	    if (task_data[head] && task_data[head]['Count']){
		console.log(tasks);
		total_data = total_data + '<td onclick="show_month_dialog(\''+task+'\',\''+head+'\',\''+tasks+'\')"><strong style="color: #58fffc;">'+task_data[head]['Count']+'</strong></td>';
	    }else{
		total_data = total_data + '<td><strong style="color: #58fffc;">0</strong></td>';
	    }
	    if (task_data[head] && task_data[head]['WIP']){
		total_data = total_data + '<td onclick="show_month_dialog(\''+task+'\',\''+head+'\',\''+tasks+'\')"><strong style="color: #58fffc;">'+task_data[head]['WIP']+'</strong></td>';
	    }else{
		total_data = total_data + '<td><strong style="color: #58fffc;">0</strong></td>';
	    }
	    if (task_data[head] && task_data[head]['Internal']){
		total_data = total_data + '<td onclick="show_month_dialog(\''+task+'\',\''+head+'\',\''+tasks+'\')"><strong style="color: #58fffc;">'+task_data[head]['Internal']+'</strong></td>';
	    }else{
		total_data = total_data + '<td><strong style="color: #58fffc;">0</strong></td>';
	    }
	    if (task_data[head] && task_data[head]['Review']){
		total_data = total_data + '<td onclick="show_month_dialog(\''+task+'\',\''+head+'\',\''+tasks+'\')"><strong style="color: #58fffc;">'+task_data[head]['Review']+'</strong></td>';
	    }else{
		total_data = total_data + '<td><strong style="color: #58fffc;">0</strong></td>';
	    }
	    if (task_data[head] && task_data[head]['Approved']){
		total_data = total_data + '<td onclick="show_month_dialog(\''+task+'\',\''+head+'\',\''+tasks+'\')"><strong style="color: #58fffc;">'+task_data[head]['Approved']+'</strong></td>';
	    }else{
		total_data = total_data + '<td><strong style="color: #58fffc;">0</strong></td>';
	    }


	    if (task_data['Character'] && task_data['Character'][head]){
		char_data = char_data + '\
		<td style="background-color: #333333;" onclick="show_month_dialog(\''+task+'\',\''+head+'\',\''+task_data['Character'][head]['Total']['Task']+'\')"><strong style="color: #58fffc;">'+task_data['Character'][head]['Total']['Count']+'</strong></td>\
		<td style="color: #00ff1e;" onclick="show_month_dialog(\''+task+'\',\''+head+'\',\''+task_data['Character'][head]['WIP']['Task']+'\')"><strong>'+task_data['Character'][head]['WIP']['Count']+'</strong></td>\
		<td style="color: #00ff1e;" onclick="show_month_dialog(\''+task+'\',\''+head+'\',\''+task_data['Character'][head]['Internal']['Task']+'\')"><strong>'+task_data['Character'][head]['Internal']['Count']+'</strong></td>\
		<td style="color: #00ff1e;" onclick="show_month_dialog(\''+task+'\',\''+head+'\',\''+task_data['Character'][head]['Review']['Task']+'\')"><strong>'+task_data['Character'][head]['Review']['Count']+'</strong></td>\
		<td style="color: #00ff1e;" onclick="show_month_dialog(\''+task+'\',\''+head+'\',\''+task_data['Character'][head]['Approved']['Task']+'\')"><strong>'+task_data['Character'][head]['Approved']['Count']+'</strong></td>\
		'; 
	    }else{
		char_data = char_data + '<td style="background-color: #333333;"><strong style="color: #58fffc;">0</strong></td><td>0</td><td>0</td><td>0</td><td>0</td>';
	    }

	    if (task_data['Prop'] && task_data['Prop'][head]){
		prop_data = prop_data + '\
		<td style="background-color: #333333;" onclick="show_month_dialog(\''+task+'\',\''+head+'\',\''+task_data['Prop'][head]['Total']['Task']+'\')"><strong style="color: #58fffc;">'+task_data['Prop'][head]['Total']['Count']+'</strong></td>\
		<td style="color: #00ff1e;" onclick="show_month_dialog(\''+task+'\',\''+head+'\',\''+task_data['Prop'][head]['WIP']['Task']+'\')"><strong>'+task_data['Prop'][head]['WIP']['Count']+'</strong></td>\
		<td style="color: #00ff1e;" onclick="show_month_dialog(\''+task+'\',\''+head+'\',\''+task_data['Prop'][head]['Internal']['Task']+'\')"><strong>'+task_data['Prop'][head]['Internal']['Count']+'</strong></td>\
		<td style="color: #00ff1e;" onclick="show_month_dialog(\''+task+'\',\''+head+'\',\''+task_data['Prop'][head]['Review']['Task']+'\')"><strong>'+task_data['Prop'][head]['Review']['Count']+'</strong></td>\
		<td style="color: #00ff1e;" onclick="show_month_dialog(\''+task+'\',\''+head+'\',\''+task_data['Prop'][head]['Approved']['Task']+'\')"><strong>'+task_data['Prop'][head]['Approved']['Count']+'</strong></td>\
		'; 
	    }else{
		prop_data = prop_data + '<td style="background-color: #333333;"><strong style="color: #58fffc;">0</strong></td><td>0</td><td>0</td><td>0</td><td>0</td>';
	    }
	    
	    if (task_data['Set'] && task_data['Set'][head]){
		set_data = set_data + '\
		<td style="background-color: #333333;" onclick="show_month_dialog(\''+task+'\',\''+head+'\',\''+task_data['Set'][head]['Total']['Task']+'\')"><strong style="color: #58fffc;">'+task_data['Set'][head]['Total']['Count']+'</strong></td>\
		<td style="color: #00ff1e;" onclick="show_month_dialog(\''+task+'\',\''+head+'\',\''+task_data['Set'][head]['WIP']['Task']+'\')"><strong>'+task_data['Set'][head]['WIP']['Count']+'</strong></td>\
		<td style="color: #00ff1e;" onclick="show_month_dialog(\''+task+'\',\''+head+'\',\''+task_data['Set'][head]['Internal']['Task']+'\')"><strong>'+task_data['Set'][head]['Internal']['Count']+'</strong></td>\
		<td style="color: #00ff1e;" onclick="show_month_dialog(\''+task+'\',\''+head+'\',\''+task_data['Set'][head]['Review']['Task']+'\')"><strong>'+task_data['Set'][head]['Review']['Count']+'</strong></td>\
		<td style="color: #00ff1e;" onclick="show_month_dialog(\''+task+'\',\''+head+'\',\''+task_data['Set'][head]['Approved']['Task']+'\')"><strong>'+task_data['Set'][head]['Approved']['Count']+'</strong></td>\
		'; 
	    }else{
		set_data = set_data + '<td style="background-color: #333333;"><strong style="color: #58fffc;">0</strong></td><td>0</td><td>0</td><td>0</td><td>0</td>';
	    }

	});
	tr_char = '<tr>'+task_name+char_data+'</tr>';
	tr_prop = '<tr>'+prop_data+'</tr>';
	tr_set = '<tr>'+set_data+'</tr>';
	tr_total = '<tr style="background-color: #333333;">'+total_data+'</tr>';
	$("#tbl_asset_build").append(tr_char+tr_prop+tr_set+tr_total);
    
    });
}
function show_month_dialog(task,month,tasks){

/*
    arr_task = [];
    if (tasks){
	arr_task = tasks.split(',');
    }
    $.each(arr_task, function(idx,task){
	alert(task);	
    });
*/
    all_tasks = tasks.replace(/,/g,'<br>')
    $('#show_monthly_task').html('');
    $('#show_monthly_task').append('<p>Task Name : <strong style="color: #00ff1e;">'+task+'<strong></p>');
    $('#show_monthly_task').append('<p>Month : <strong style="color: #00ff1e;">'+month+'<strong></p>');
    $('#show_monthly_task').append('<p><strong>Tasks : <strong></p><p>'+all_tasks+'</p>');
    $("#myModal").modal('show');
}
function mgm_dashboard(){

    project_id = $('#selectMGMDashProject').val();
    if(!project_id){
	alert("Please select valid project !!!");
    }

    project = $("#selectMGMDashProject option[value='"+project_id+"']").text(); 

    $.ajax({
	type: "POST",
	url: "/callajax/",
	data : {'object_name': 'MGM Dashboard', 'project': project},
	beforeSend: function(){
	    remove_rows('#tbl_sequence');
	    remove_rows('#tbl_asset_build');
	    $('#div_dash_users_count').html('');
        },
	success: function(json){
	    $.each(json,function(idx,obj){

		var users_data = obj.user_count;
		show_total_users(users_data);
	
		var sequence_data = obj.sequence;
		create_sequence_table(sequence_data);
		
		var asset_build_data = obj.asset_build;
		create_asset_build_table(asset_build_data);
	    });	    
	},
	error: function(error){
	    console.log("Error:"+error);
	}

    });
}

function show_total_users(data) {
        var user = '';
        var total = '';
        var task = '';
        $.each(data, function(key, value){

	    var count = Object.keys(value).length;
            if(key == 'total_users'){
                total = "<div class='box col-at-1' "+
                            "style='display:block;text-align:center;'>"+
                          "<div class='controls'>"+"<label class='label_style'>"+
                          key+" &nbsp;</label><br/>"+"<div class='count_task' style='font-size:20px;color:darkorange'>"+
                          count + "</div></div></div>";
            }
            else{
                task = task + "<div class='box col-at-1' "+
                            "style='display:block;text-align:center;'>"+
                          "<div class='controls'>"+"<label class='label_style'>"+
                          key+" &nbsp;</label><br/>"+"<div class='count_task' style='font-size:20px;color:#00fff6'>"+
                          count + "</div></div></div>";
            }
        });
        $('#div_dash_users_count').append(total+task);
}


function create_sequence_table(data){

    $.each(data, function(seq,task_status){
	wip_data = '<td rowspan="3"><h3>'+seq+'</h3></td><td rowspan="3"><h5>'+task_status.total_shots+'</h5></td><td>WIP</td>';
	done_data = '<td>DONE</td>';
	approved_data = '<td>APPROVED</td>';
	$.each($("#tbl_sequence th"), function(idx) {
	    if (idx <= 2)
		return;

	    head = $(this).text();
	    if (task_status.WIP[head] == 0){ 
		wip_data = wip_data + '<td>'+task_status.WIP[head]+'</td>';
	    }else{
		wip_data = wip_data + '<td><strong style="color: #00ff1e;">'+task_status.WIP[head]+'</strong></td>';
	    }
	    if (task_status.DONE[head] == 0){ 
		done_data = done_data + '<td>'+task_status.DONE[head]+'</td>';
	    }else{
		done_data = done_data + '<td><strong style="color: #00ff1e;">'+task_status.DONE[head]+'</strong></td>';
	    }
	    if (task_status.APPROVED[head] == 0){ 
		approved_data = approved_data + '<td>'+task_status.APPROVED[head]+'</td>';
	    }else{
		approved_data = approved_data + '<td><strong style="color: #00ff1e;">'+task_status.APPROVED[head]+'</strong></td>';
	    }
	});
	tr_wip = '<tr>'+wip_data+'</tr>';
	tr_done = '<tr>'+done_data+'</tr>';
	tr_approved = '<tr>'+approved_data+'</tr>';
	$("#tbl_sequence").append(tr_wip+tr_done+tr_approved)
    
    });
}
function create_asset_build_table(data){

    $.each(data, function(asset_type,task_status){
	wip_data = '<td rowspan="3"><h3>'+asset_type+'</h3></td><td rowspan="3"><h5>'+task_status.total_assets+'</h5></td><td>WIP</td>';
	done_data = '<td>DONE</td>';
	approved_data = '<td>APPROVED</td>';
	$.each($("#tbl_asset_build th"), function(idx) {
	    if (idx <= 2)
		return;

	    head = $(this).text();
	    if (task_status.WIP[head] == 0){ 
		wip_data = wip_data + '<td>'+task_status.WIP[head]+'</td>';
	    }else{
		wip_data = wip_data + '<td><strong style="color: #00ff1e;">'+task_status.WIP[head]+'</strong></td>';
	    }
	    if (task_status.DONE[head] == 0){ 
		done_data = done_data + '<td>'+task_status.DONE[head]+'</td>';
	    }else{
		done_data = done_data + '<td><strong style="color: #00ff1e;">'+task_status.DONE[head]+'</strong></td>';
	    }
	    if (task_status.APPROVED[head] == 0){ 
		approved_data = approved_data + '<td>'+task_status.APPROVED[head]+'</td>';
	    }else{
		approved_data = approved_data + '<td><strong style="color: #00ff1e;">'+task_status.APPROVED[head]+'</strong></td>';
	    }
	});
	tr_wip = '<tr>'+wip_data+'</tr>';
	tr_done = '<tr>'+done_data+'</tr>';
	tr_approved = '<tr>'+approved_data+'</tr>';
	$("#tbl_asset_build").append(tr_wip+tr_done+tr_approved)
    
    });
}

$('#show_prod_records').click(function(){
    artist_productivity();

});

function artist_productivity(){

    project_id = $('#selectDashProject').val();
    if(!project_id){
	alert("Please select valid project !!!");
    }

    project = $("#selectDashProject option[value='"+project_id+"']").text(); 
    duration = $('#reportrange span').html();
    if(!duration){
	alert("Please select valid duration !!!");
    }

    artist = $('#selectUsers').val();

    dur_arr = duration.split(' : ');

    first = dur_arr[0];
    last = dur_arr[1];

    $.ajax({
	type: "POST",
	url: "/callajax/",
	data : {'object_name': 'Artist Productivity', 'project': project, 'first': first, 'last': last, 'artist': artist},
	beforeSend: function(){
	    remove_rows('#tbl_shot_task');
	    remove_rows('#tbl_asset_build_task');
            $('#panel_big').plainOverlay('show');
        },
	success: function(json){
	    $.each(json,function(idx,obj){
		if (obj.Shot){
		$.each(obj.Shot,function(idx,data){
		    row = artist_prod_table(data,'Shot');
		    $("#tbl_shot_task tbody").append(row);
		});
		}
		if (obj.Asset_Build){
		$.each(obj.Asset_Build,function(idx,data){
		    row = artist_prod_table(data,'Asset_Build');
		    $("#tbl_asset_build_task tbody").append(row);
		});
		}
	    });	    
            $('#panel_big').plainOverlay('hide');
	},
	error: function(error){
	    console.log("Error:"+error);
	}

    });
}
function create_table_modal(){
    var table = '<table table class="table-hover table-condensed table-bordered" id="my_modal_table" style="width:100%">'+
                '<thead><th>Tasks</th><th>Bids</th><th>Actual Bids</th></thead><tbody></tbody></table>';
    $('#show_artist_prod_task').append(table);
}

function show_task_dialog(artist,table_tr){

/*
    arr_task = [];
    if (tasks){
	arr_task = tasks.split(',');
    }
    $.each(arr_task, function(idx,task){
	alert(task);	
    });
*/
    
/*    all_tasks = tasks.replace(/,/g,'<br>')
    $('#show_artist_prod_task').html('');
    $('#show_artist_prod_task').append('<p>Artist Name : <strong style="color: #00ff1e;">'+artist+'<strong></p>');
    $('#show_artist_prod_task').append('<p><strong>Tasks : <strong></p><p>'+all_tasks+'</p>');
    $("#myModal").modal('show');*/

    $('#show_artist_prod_task').html('');
    create_table_modal();
    $('#show_artist_prod_task').append('<p style="padding-left:348px;padding-right:200px;">Artist Name :'+
    '<strong style="color: #00ff1e;">'+artist+'<strong></p>');

    $("#my_modal_table tbody").append(table_tr);

    $('#show_artist_prod_task').append($("#my_modal_table"));
    $("#myModal").modal('show');
}

function artist_prod_task_count_table(tasks){

    var table_val = '';
    $.each(tasks, function(idx, obj){
        tr = '<tr><td>'+obj.task_name+'</td>';
        tr += '<td>'+obj.bid+'</td>';
        tr += '<td>'+obj.actual_bid+'</td></tr>';
        table_val += tr
    });
    return table_val;
}

function artist_prod_table(data, parent_object_type){

    frame_sec = '';
    avg_per_day = '';
    A_frame_sec = '';
    A_avg_per_day = '';
    B_frame_sec = '';
    B_avg_per_day = '';
    C_frame_sec = '';
    C_avg_per_day = '';
    D_frame_sec = '';
    D_avg_per_day = '';

    if (parent_object_type == 'Shot'){
	frame_sec = '<td><strong>'+data.frame_sec+'</strong></td>';
	avg_per_day = '<td><strong>'+data.avg_per_day+'</strong></td>';

	A_frame_sec = '<td><strong>'+data.Urgent.frame_sec+'</strong></td>';
	A_avg_per_day = '<td><strong>'+data.Urgent.avg_per_day+'</strong></td>';
	B_frame_sec = '<td><strong>'+data.High.frame_sec+'</strong></td>';
	B_avg_per_day = '<td><strong>'+data.High.avg_per_day+'</strong></td>';
	C_frame_sec = '<td><strong>'+data.Medium.frame_sec+'</strong></td>';
	C_avg_per_day = '<td><strong>'+data.Medium.avg_per_day+'</strong></td>';
	D_frame_sec = '<td><strong>'+data.Low.frame_sec+'</strong></td>';
	D_avg_per_day = '<td><strong>'+data.Low.avg_per_day+'</strong></td>';
    }

    color_code = 'style="color:#a7ff0c"';
    
    if (/^-/.test(data.variance)){
	color_code = 'style="color:#ff2a0c"';
    }
    
    /*
    * function to just return the table html
    * data and append it to table on click of td                 
    */
    s = artist_prod_task_count_table(data.tasks);

    row = '<tr>\
	<td nowrap><strong>'+data.artist+'</strong></td>\
	<td style="background-color: #333333;" onclick="show_task_dialog(\''+data.artist+'\',\''+s+'\')"><strong style="color: #58fffc;">'+data.task_count+'</strong></td>\
	'+frame_sec+'\
	<td><strong>'+data.bid_days+'</strong></td>\
	<td><strong>'+data.actual_bid+'</strong></td>\
	<td><strong '+color_code+'>'+data.variance+'</strong></td>\
	'+avg_per_day+'\
    ';
    color_code = 'style="color:#a7ff0c"';
    
    if (/^-/.test(data.Urgent.variance)){
	color_code = 'style="color:#ff2a0c"';
    }
	ut = artist_prod_task_count_table(data.Urgent.tasks);
        tda = '\
	<td style="background-color: #333333;" onclick="show_task_dialog(\''+data.artist+'\',\''+ut+'\')"><strong style="color: #58fffc;">'+data.Urgent.task_count+'</strong></td>\
	'+A_frame_sec+'\
	<td><strong>'+data.Urgent.bid_days+'</strong></td>\
	<td><strong>'+data.Urgent.actual_bid+'</strong></td>\
	<td><strong '+color_code+'>'+data.Urgent.variance+'</strong></td>\
	'+A_avg_per_day+'\
	';
    color_code = 'style="color:#a7ff0c"';
    
    if (/^-/.test(data.High.variance)){
	color_code = 'style="color:#ff2a0c"';
    }
        ht = artist_prod_task_count_table(data.High.tasks);
	tdb = '\
	<td style="background-color: #333333;" onclick="show_task_dialog(\''+data.artist+'\',\''+ht+'\')"><strong style="color: #58fffc;">'+data.High.task_count+'</strong></td>\
	'+B_frame_sec+'\
	<td><strong>'+data.High.bid_days+'</strong></td>\
	<td><strong>'+data.High.actual_bid+'</strong></td>\
	<td><strong '+color_code+'>'+data.High.variance+'</strong></td>\
	'+B_avg_per_day+'\
	';
    color_code = 'style="color:#a7ff0c"';
    
    if (/^-/.test(data.Medium.variance)){
	color_code = 'style="color:#ff2a0c"';
    }
	mt = artist_prod_task_count_table(data.Medium.tasks);
        tdc = '\
	<td style="background-color: #333333;" onclick="show_task_dialog(\''+data.artist+'\',\''+mt+'\')"><strong style="color: #58fffc;">'+data.Medium.task_count+'</strong></td>\
	'+C_frame_sec+'\
	<td><strong>'+data.Medium.bid_days+'</strong></td>\
	<td><strong>'+data.Medium.actual_bid+'</strong></td>\
	<td><strong '+color_code+'>'+data.Medium.variance+'</strong></td>\
	'+C_avg_per_day+'\
	';
    color_code = 'style="color:#a7ff0c"';
    
    if (/^-/.test(data.Low.variance)){
	color_code = 'style="color:#ff2a0c"';
    }
	lt = artist_prod_task_count_table(data.Low.tasks);
        tdd = '\
	<td style="background-color: #333333;" onclick="show_task_dialog(\''+data.artist+'\',\''+lt+'\')"><strong style="color: #58fffc;">'+data.Low.task_count+'</strong></td>\
	'+D_frame_sec+'\
	<td><strong>'+data.Low.bid_days+'</strong></td>\
	<td><strong>'+data.Low.actual_bid+'</strong></td>\
	<td><strong '+color_code+'>'+data.Low.variance+'</strong></td>\
	'+D_avg_per_day+'\
	';
    row = row + tda + tdb + tdc + tdd + '</tr>';
    return row
}

$('#show_records').click(function(){
    user_dashboard();

});

function user_dashboard(){

    project_id = $('#selectDashProject').val();
    if(!project_id){
	alert("Please select valid project !!!");
    }

    project = $("#selectDashProject option[value='"+project_id+"']").text(); 
    duration = $('#reportrange span').html();
    if(!duration){
	alert("Please select valid duration !!!");
    }

    task = $('#selectTask').val();

    dur_arr = duration.split(' : ');

    first = dur_arr[0];
    last = dur_arr[1];

    $.ajax({
	type: "POST",
	url: "/callajax/",
	data : {'object_name': 'User Dashboard', 'project': project, 'duration': duration, 'first': first, 'last': last, 'task': task},
	beforeSend: function(){
	    remove_rows('#tbl_task');
	    $("#div_task_details .dashboard-list").remove();
	    $("#div_status_count .dashboard-list").remove();
	    $("#div_task_count .dashboard-list").remove();
            $('#panel_big').plainOverlay('show');
        },
	success: function(json){
	    $.each(json,function(idx,obj){

		var task_data = obj.task_list;
		user_task_table(task_data);
		
		var top_data = obj.top_task_users;
		top_artist(top_data);
	
		var task_count_data = obj.task_count_data;
		task_count(task_count_data);

		var task_chart_type = 'pie';
		var data = obj.tash_graph_data;
		var div_id = 'chart_task_details';
		var title_text = 'Task';
		plot_chart(data,div_id,title_text,task_chart_type);

		var status_chart_type = 'doughnut';
		var status_data = obj.status_graph_data;
		var status_div_id = 'chart_status_details';
		var status_title_text = 'Status';
		plot_chart(status_data,status_div_id,status_title_text,status_chart_type);
		status_count(status_data);
	    });	    
            $('#panel_big').plainOverlay('hide');
	},
	error: function(error){
	    console.log("Error:"+error);
	}

    });
}

function user_task_table(data){

    $.each(data, function(idx,obj){
	row = '<tr>\
	<td title="Task"><strong>'+obj.task_name+'</strong></td>\
	<td><strong>'+obj.task+'</strong></td>\
	<td title="User"><strong>'+obj.user+'</strong></td>\
	<td title="Status"><strong>'+obj.ftrack_status+'</strong></td>\
	<td><strong>'+obj.start_min_date+'</strong></td>\
	<td><strong>'+obj.stop_max_date+'</strong></td>\
	<td title="Time" data-seconds="'+obj.total_seconds+'" data-task="'+obj.task_name+'"><strong>'+obj.total_hours+'</strong></td>\
	</tr>';
	$("#tbl_task").append(row);
    });
}


function top_artist(data){

    $.each(data, function(idx,obj){
	
	row = '<ul class="dashboard-list">\
	    <li onclick="highlight_this(this,\''+obj.user_id+'\',\'search\',\'tbl_task\',\'table_row_count\')">\
                <a href="#"><img class="dashboard-avatar" alt="" src="http://192.168.1.18/Employees/'+obj.empcode+'.jpg" onclick="search_value(\''+obj.user_id+'\',\'search\',\'tbl_task\',\'table_row_count\')"></a>\
		    <strong>Name:</strong>&nbsp; <a href="#">'+obj.user+'</a><br>\
                <strong>Total Time:</strong>&nbsp; <span>'+obj.time+'<span/><br>\
                <strong>Department:</strong>&nbsp; <span>'+obj.departments+'</span><br>\
                <strong>Tasks:</strong>&nbsp; <span>'+obj.tasks+'</span>\
            </li>\
	</ul>';
        $("#div_task_details").append(row);
    });
}

function highlight_this(context,user_id,search,tbl_task,table_row_count){

    div_id = $(context).parent().parent().attr('id');
    $('#'+div_id+' ul').each(function(){
	$(this).find('li').removeAttr('style');
    });

    $(context).css({"background-color": "#2e3338"});
    search_value(user_id,search,tbl_task,table_row_count);
}
/*
function status_count(data){

    $("#div_status_count").html('');
    $.each(data, function(idx,obj){
	row = '<ul class="dashboard-list">\
	    <li>\
		<a href="#" onclick="search_value(\''+obj.name+'\',\'search\',\'tbl_task\',\'table_row_count\')">\
                    <span>'+obj.x+'&nbsp;-</span>\
                    <strong>'+obj.name+'</strong>\
                </a>\
            </li>\
        </ul>';
        $("#div_status_count").append(row);
    });
}
*/
function status_count(data){

    remove_rows('#tbl_status_count');
    $.each(data, function(idx,obj){
	row = '<tr onclick="search_value(\''+obj.name+'\',\'search\',\'tbl_task\',\'table_row_count\')">\
	    <td><strong style="color: #0fff00;">' +obj.x+ '</strong></td> <td><strong>' +obj.name+ '</strong></td>\
        </tr>';
        $("#tbl_status_count").append(row);
    });
}
/*
function task_count(data){

    $("#div_task_count").html('');
    $.each(data, function(idx,obj){
	row = '<ul class="dashboard-list">\
	    <li>\
		<a href="#" onclick="search_value(\''+obj.name+'\',\'search\',\'tbl_task\',\'table_row_count\')">\
                    <span>'+obj.count+'&nbsp;-</span>\
                    <strong>'+obj.name+'</strong>\
                </a>\
            </li>\
        </ul>';
        $("#div_task_count").append(row);
    });
}
*/
function task_count(data){

    remove_rows('#tbl_task_count');
    $.each(data, function(idx,obj){
	row = '<tr onclick="search_value(\''+obj.name+'\',\'search\',\'tbl_task\',\'table_row_count\')">\
	    <td><strong style="color: #0fff00;">' +obj.count+ '</strong></td> <td><strong>' +obj.name+ '</strong></td> <td><strong>' +obj.hours+ '</strong></td>\
        </tr>';
        $("#tbl_task_count").append(row);
    });
}

$('#clear_search').click(function(){
    search_value('', 'search', 'tbl_task', 'table_row_count');
    $('#div_task_details ul').each(function(){
        $(this).find('li').removeAttr('style');
    });

});

function search_value(value, search_box, table, table_row_count){

    $search = $('#'+search_box);

    $search.val(value)
    // Show only matching TR, hide rest of them
   if ($search.val() === ''){
        $search.css({"border-color": "#333"})
    }else{
        $search.css({"border-color": "#5897fb"})
    }
    $.each($("#"+table+" tbody tr"), function(idx) {
	
        if($(this).text().toLowerCase().indexOf($search.val().toLowerCase()) === -1)
            $(this).hide();
        else
            $(this).show();
        });
    len = $('#'+table+' tbody tr:visible').length;
    $('#'+table_row_count).html(len);

    show_dashboard_graphs();
}

function show_dashboard_graphs(){

    var task_hash = {};
    $('#tbl_task tr:visible td').each(function(index) {
	var th_name = $(this).attr('title');
	if (th_name == 'Time'){
	    var td_name = $(this).attr('data-task');
	    var seconds = $(this).attr('data-seconds');
	    key = th_name + ':' + td_name
	    if(!task_hash[th_name]){
		task_hash[th_name] = {};
	    }
	    if(!task_hash[th_name][td_name]){
		task_hash[th_name][td_name] = parseInt(seconds);
	    }else{
		task_hash[th_name][td_name] = task_hash[th_name][td_name] + parseInt(seconds);
	    }
	}
	if (th_name == 'Status'){
	    var td_name = $(this).text();
	    key = th_name + ':' + td_name
	    if(!task_hash[th_name]){
		task_hash[th_name] = {};
	    }
	    if(!task_hash[th_name][td_name]){
		task_hash[th_name][td_name] = 1;
	    }else{
		task_hash[th_name][td_name]++;
	    }
	}
	if (th_name == 'Task'){
	    var td_name = $(this).text();
	    key = th_name + ':' + td_name
	    if(!task_hash[th_name]){
		task_hash[th_name] = {};
	    }
	    if(!task_hash[th_name][td_name]){
		task_hash[th_name][td_name] = 1;
	    }else{
		task_hash[th_name][td_name]++;
	    }
	}
    });
//    alert(task_hash['Task']['Previz']+':'+task_hash['Time']['Previz']);

    var status_data = [];
    var time_data = [];
    var task_data = [];
    for (var key in task_hash){
	if (task_hash.hasOwnProperty(key)) {
	    if (key == 'Status'){
		for (var child_key in task_hash[key]){
		    if (task_hash[key].hasOwnProperty(child_key)) {
			status_data.push({x:task_hash[key][child_key], y:task_hash[key][child_key],name:child_key});
		    }
		}
	    }

	    if (key == 'Time'){
		for (var child_key in task_hash[key]){
		    if (task_hash[key].hasOwnProperty(child_key)) {
			time_x = secondsTimeSpanToHMS(task_hash[key][child_key]);
			time_data.push({x:time_x, y:task_hash[key][child_key],name:child_key});
		    }
		}
	    }

	    if (key == 'Task'){
		for (var child_key in task_hash[key]){
		    if (task_hash[key].hasOwnProperty(child_key)) {
			task = child_key;
			time_sec = task_hash['Time'][task];
			time_hrs = secondsTimeSpanToHMS(time_sec);
			task_data.push({hours:time_hrs, count:task_hash[key][child_key],name:child_key});
		    }
		}
	    }
	}
    }

    task_count(task_data);

    var status_chart_type = 'doughnut';
    var status_div_id = 'chart_status_details';
    var status_title_text = 'Status';
    plot_chart(status_data,status_div_id,status_title_text,status_chart_type);
    status_count(status_data);

    var task_chart_type = 'pie';
    var div_id = 'chart_task_details';
    var title_text = 'Task';
    plot_chart(time_data,div_id,title_text,task_chart_type);

}

/*
    function to show task count details
    on click event on status count table
*/

function show_task_count_details(context){

    remove_rows('#status_count_table');

        // getting the row index of particular clicked td;
        var tbody_td_index = $(context).parent().index();

        // stores the th name of the clicked td
        var index_var = $(context).index();

        var new_th_name = $('#new_table th').eq(index_var).text();

        // stores the current clicked td status  from the status column.
        var status = $(context).closest('td').siblings(':first-child').text();

        // get the table header name from tbl_task table
        var task = $('#tbl_task th').eq(index_var).text();

        // get the selected project name from project dropdown
        var project_name = $('#selectProject option:selected').text();

        //$('#project_id').val(project_name);
        $("label[data-id='project']").text(project_name);

        var obj_value = $('#selectObject option:selected').text();

        $("label[data-id='objects']").text(obj_value);
        //$('#object_id').val(obj_value);
        if(obj_value == 'Asset Build')
            var type_name = $('#selectType option:selected').text();
        else
            var type_name = $('#selectSequence option:selected').text();

        //$('#asset_sequ_id').val(type_name);

        $("label[data-id='sequences']").text(type_name);

        var asset_name = '';

        var task_name = '';

        var i = (index_var * 2) - 1;

	var flag = {};
        $('#tbl_task tbody tr').each(function(){

            //different assets from the table
            asset_name = $(this).children("td:first-child").text();

	    // below code for shot asset build
	    arr = asset_name.split(' ');
            if (arr.length > 2)
                asset_name = arr[1];

            if (flag[asset_name])
                return true;
	    
	    flag[asset_name] = 1;

            // task name in proper format
            task_name = project_name + ":" + asset_name + ":" + task;

            // getting the selected column colspan
            s = $('#tbl_task tr th').eq(index_var).prop('colspan');//.text();

            var j = 0;

            //if( s > 1){

                //status of the selected task
                var prev_status = $('td', this).eq(i).text();
                if(status == prev_status){
                  //user assigned to selected task
                  var assigned_user = $('td', this).eq(i + 1).text();
                  var row = $("<tr>");
                  row.append("<td>" + task +"</td>");
                  row.append("<td>" + task_name +"</td>");
                  row.append("<td>" + assigned_user +"</td>");
                  row.append("<td>" + prev_status +"</td>");
                  $("#status_count_table").append(row);
                }else if(status == 'Total'){
                  var assigned_user = $('td', this).eq(i + 1).text();
                  var row = $("<tr>");
                  row.append("<td>" + task +"</td>");
                  row.append("<td>" + task_name +"</td>");
                  row.append("<td>" + assigned_user +"</td>");
                  row.append("<td>" + prev_status +"</td>");
                  $("#status_count_table").append(row);
		}
            //}

        });
        //return false;
        $('#mytaskcount').modal('show');
}

$('#selectArtistProject').change(function(){
    show_artist_tasks();
});
$('#selectStatus').change(function(){
    show_artist_tasks();
});
$('#task_refresh').click(function(){
    show_artist_tasks();
});

function artist_action(param){

    action = '';
    action_attr = $(param).attr('title');
    note_text = '';
    if (action_attr == 'START'){
	action = 'Started';
    }else if (action_attr == 'PAUSE'){
	action = 'Paused';
	note_text = prompt("Why you want to pause the task ?", "");
	if (note_text != null)
	    note_text = note_text.trim();

        if (!(note_text.length)){
            alert("invalid reason ...");
            return null;
        }
    }else if (action_attr == 'REVIEW'){
	action = 'Review';
    }else{
	action = 'Stopped';
    }

    fn_artist_task_action(param,action,note_text);
}

function fn_artist_task_action(param,action,note_text){

    $tr = $(param).closest('tr');

    project = $tr.attr('data-project');
    task_id = $tr.attr('data-task-id');

    $.ajax({
	type: "POST",
	url: "/callajax/",
	data : {'object_name': 'Artist Action', 'project': project, 'task_id': task_id, 'action': action, 'note_text': note_text},
	beforeSend: function(){
        },
	success: function(json){
//	    $.each(json,function(idx,obj){
//	    });
                    noty({
                            text: 'Your task has been '+action,
                            layout: 'topCenter',
                            closeWith: ['click', 'hover'],
                            type: 'success'
			});
		setTimeout(location.reload.bind(location), 3000);
	},
	error: function(error){
	    console.log("Error:"+error);
	}

    });

}

function show_artist_tasks(){

    project_id = $('#selectArtistProject').val();
    if(!project_id){
	    alert("Please select valid project !!!");
    }

    project = $("#selectArtistProject option[value='"+project_id+"']").text();
    selected_status = $('#selectStatus').val();

    $.ajax({
	type: "POST",
	url: "/callajax/",
	data : {'object_name': 'Artist Tasks', 'project': project, 'status': selected_status},
	beforeSend: function(){
	    remove_rows('#tbl_task');
        },
	success: function(json){
	    $.each(json,function(idx,obj){
	        color_code = 'style="color:#a7ff0c"';
	        if (obj.time_left.startsWith('-')){
	            color_code = 'style="color:#ff2a0c"'
	        }
		action_play = 'display:none;';
		action_pause = 'display:none;';
		action_stop = 'display:none;';
		action_review = 'display:none;';
		if (obj.backup_status == 'Started'){
		    action_pause = '';
		    action_stop = '';
		    action_review = '';
		}else if (obj.backup_status == 'Paused'){
		    action_play = '';
		    action_stop = '';
		}else{
		    action_play = '';
		}
	        table_row = '\
            <tr data-project="'+obj.project+'" data-task-id="'+obj.task_id+'" data-task-parent-id="'+obj.parent_id+'" data-parent-object-type="'+obj.parent_object_type+'" data-project-id="'+obj.project_id+'">\
                  <td>\
                    <strong>'+obj.project+'</strong>\
                  </td>\
                  <td>\
                    <strong>'+obj.task+'</strong>\
                  </td>\
                  <td style="width:400px;" data-task-id="'+obj.task_id+'" data-task-assignee="'+obj.user_name+'" data-task-parent-id="'+obj.parent_id+'">\
                    <strong><a href="#" id="task_object"\
                               onclick="show_model(this)">[ '+obj.path+' ]</a></strong>\
                  </td>\
                  <td data-task-id="'+obj.task_id+'"\
                      data-org-val="'+obj.ftrack_status+'"\
                      data-project-id="'+obj.project_id+'">\
                    <span class="label label-'+obj.status_label+'">'+obj.ftrack_status+'</span>\
                  </td>\
                  <td>\
                    <strong>'+obj.start_date+'</strong>\
                  </td>\
                  <td>\
                    <strong>'+obj.finish_date+'</strong>\
                  </td>\
                  <td>\
                    <span class="label label-'+obj.backup_status+'">'+obj.backup_status+'</span>\
                  </td>\
                  <td>\
                    <strong>'+obj.upload_date+'</strong>\
                  </td>\
                  <td>\
                    <strong>'+obj.bid_hours+'</strong>\
                  </td>\
                  <td>\
                    <strong>'+obj.total_hours+'</strong>\
                  </td>\
                  <td>\
                    <strong '+color_code+'>'+obj.time_left+'</strong>\
                  </td>\
		  <td style="width: 205px;">\
                    <button title="START" class="btn btn-inverse btn-success btn-sm" id="task_approved"\
                            style="color: black;'+action_play+'" onclick="artist_action(this)">\
                      <i class="glyphicon glyphicon-play"></i>\
                    </button>\
                    <button title="PAUSE" class="btn btn-inverse btn-warning btn-sm" id="task_pause"\
                            style="color: black;'+action_pause+'" onclick="artist_action(this)">\
                      <i class="glyphicon glyphicon-pause"></i>\
                    </button>\
                    <button title="STOP" class="btn btn-inverse btn-danger btn-sm" id="task_reject"\
                            style="color: black;'+action_stop+'" onclick="artist_action(this)">\
                      <i class="glyphicon glyphicon-stop"></i>\
                    </button>\
                    <button title="REVIEW" class="btn btn-inverse btn-primary btn-sm" id="task_review"\
                            style="color: black;'+action_review+'" onclick="artist_action(this)">\
                      <i class="glyphicon glyphicon-send"></i>\
                    </button>\
                  </td>\
                </tr>';
            $('#tbl_task tbody').append(table_row);
	    });
	},
	error: function(error){
	    console.log("Error:"+error);
	}

    });
}
$('#selectReviewProject').change(function(){
    show_review_tasks();
});
$('#selectReviewStatus').change(function(){
    show_review_tasks();
});

function show_review_tasks(){

    project = $('#selectReviewProject').val();
    if(!project){
	    alert("Please select valid project !!!");
    }

    review_status = $('#selectReviewStatus').val();

    $.ajax({
	type: "POST",
	url: "/callajax/",
	data : {'object_name': 'Review Tasks', 'project': project, 'status': review_status},
	beforeSend: function(){
	    remove_rows('#tbl_task');
	    $('#panel_big').plainOverlay('show');
        },
	success: function(json){
	    $.each(json,function(idx,obj){
	        table_row = '\
	    <tr data-task-id="'+obj.task_id+'" data-version-id="'+obj.version_id+'" data-object-type="'+obj.object_type+'">\
                  <td><strong>'+obj.project+'</strong></td>\
                  <td><strong>'+obj.task+'</strong></td>\
                  <td style="width:300px;" data-task-id="'+obj.task_id+'" data-td="task_path"><strong>'+obj.path+'</strong></td>\
                  <td data-td="version"><strong>'+obj.version+'</strong></td>\
                  <td data-td="users"><strong>'+obj.users+'</strong></td>\
                  <td title="'+obj.task+'" data-task-id="'+obj.task_id+'" data-org-val="'+obj.ftrack_status+'" data-td="status">\
                    <span class="label label-'+obj.status_label+'">'+obj.ftrack_status+'</span>\
                  </td>\
                  <td data-td="modified_date"><strong>'+obj.updated_on+'</strong></td>\
                  <td>\
                    <button class="btn btn-inverse btn-success btn-sm" id="task_approved" style="color: black;" onclick="approve_task(this)">\
                      <i class="glyphicon glyphicon-thumbs-up"></i>&nbsp;&nbsp;Approve </button>\
                    <button class="btn btn-inverse btn-danger btn-sm" id="task_reject" style="color: black;" onclick="reject_task(this)">\
                      <i class="glyphicon glyphicon-thumbs-down"></i>&nbsp;&nbsp;Reject </button>\
                  </td>\
                </tr>';
            $('#tbl_task tbody').append(table_row);
	    });
	    $('#panel_big').plainOverlay('hide');
	},
	error: function(error){
	    console.log("Error:"+error);
	}

    });
}
/*
function get_entity_data(entity_id,entity_type){

    if(!entity_id || !entity_type){
	alert("Not Valid !!!");
	return null;
    }

    $.ajax({
	type: "POST",
	url: "/callajax/",
	data : {'object_name': 'Entity Details', 'entity_id': entity_id, 'entity_type': entity_type},
	beforeSend: function(){
	    $('#div_entity_details').html('');
        },
	success: function(json){
	    entity_data = '\
		<div class="box col-md-3" style="text-align: center;font-size: 20px;height: 180px;">\
                <br><br>\
                <button class="btn btn-primary btn-lg">Create '+ entity_type +' +</button>\
              </div>\
	    ';
	    $.each(json,function(idx,obj){
		entity_data = entity_data + '\
		    <div class="box col-md-3" style="text-align: center;font-size: 20px;height: 180px;">\
                <br>\
                <div class="col-md-6">Name</div>\
                <div class="col-md-6">{{ proj|upper }}</div>\
                <br><br>\
                <div class="col-md-6">\
                  <button class="btn btn-primary btn-sm" onclick="get_entity_data("'++'", "'++'")">Asset Build</button>\
                </div>\
                <div class="col-md-6">\
                  <button class="btn btn-primary btn-sm" onclick="get_entity_data('{{ id }}', 'Sequence')">Sequence</button>\
                </div>\
              </div>\
		';

	    });
            $('#div_entity_details').append(entity_data);
	},
	error: function(error){
	    console.log("Error:"+error);
	}

    });
}
*/

function secondsTimeSpanToHMS(s) {
    var h = Math.floor(s/3600); //Get whole hours
    s -= h*3600;
    var m = Math.floor(s/60); //Get remaining minutes
    s -= m*60;
    return h+":"+(m < 10 ? '0'+m : m)+":"+(s < 10 ? '0'+s : s); //zero padding on minutes and seconds
}

// Asset CSV upload
$("#create_asset_csv").click(function(){
    if (this.checked){
	$('#div_create_asset_manual').css({'display':'none'});
	$('#div_create_asset_csv').css({'display':'block'});
    }else{
	$('#div_create_asset_manual').css({'display':'block'});
	$('#div_create_asset_csv').css({'display':'none'});
	//remove_rows("#csv_asset_builds");
	$("#csv_asset_builds").find("tbody tr").remove();
	$("#csv_asset_builds").find("thead tr").remove();
    }
});

$("#create_shot_csv").click(function(){
    if (this.checked){
	$('#div_create_shot_manual').css({'display':'none'});
	$('#div_create_shot_csv').css({'display':'block'});
    }else{
	$('#div_create_shot_manual').css({'display':'block'});
	$('#div_create_shot_csv').css({'display':'none'});
	$("#csv_shots").find("tbody tr").remove();
	$("#csv_shots").find("thead tr").remove();
    }
});
function csv_upload_files(param){
    $("#csv_fileupload").click();

    entity = '';
    csv_entity = $(param).attr('id');
    if (csv_entity == 'asset_csv'){
	entity = 'AssetBuild';
    }else{
	entity = 'Shot';
    }
$("#csv_fileupload").fileupload({
    dataType: 'json',
    sequentialUploads: true,
    url: '/callajax/',

    start: function (e) {
      $(".progress").css({"display":"block"});
    },

    stop: function (e) {
      $(".progress-bar").css({"width": "0%"});
      $(".progress-bar").text("0%");
      $(".progress").css({"display":"none"});
    },

    progressall: function (e, data) {
      var progress = parseInt(data.loaded / data.total * 100, 10);
      var strProgress = progress + "%";
      $(".progress-bar").css({"width": strProgress});
      $(".progress-bar").text(strProgress);
    },

    done: function (e, data) {
      if (data.result.is_valid) {
        $("#attached_csv_file").html(data.result.name);

	// show uploaded csv
	parent_id = get_parent_id()
	project = get_project_name()
	file_path = data.result.url;
	show_upload_csv(file_path,entity,parent_id,project);
      }
    }

  });
}
function show_upload_csv(file_path,entity,parent_id,project){
    div = '';
    if (entity == 'AssetBuild'){
	div = 'csv_asset_builds';
    }else{
	div = 'csv_shots';
    }
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data:{
        'object_name': 'Show Upload CSV',
        'project': project,
        'create_entity': entity,
        'parent_id': parent_id,
        'file_path': file_path
        },
	beforeSend: function(){
	    $('#'+div+' thead').html('');
	    $('#'+div+' tbody').html('');
        },
        success:function(json){
	    if(json.AssetBuild){
		$.each(json.AssetBuild, function(idx, data){
		    get_asset_row_csv(idx,data,div);
		});
	    }else{
		$.each(json.Shot, function(idx, data){
		   get_shot_row_csv(idx,data,div);
		});
	    }
        }
    });
}

function get_asset_row_csv(idx,data,div){
    tr = '';
    invalid_data = 'data-invalid="0"';
    if (data.invalid == 1){
        invalid_data = 'style="background-color:#ed4343;color:black" data-invalid="1"';
    }

    if (idx == 0){
        tr = '\
	<tr>\
	    <th>'+data.asset_name+'</th>\
	    <th>'+data.asset_type+'</th>\
	    <th>'+data.description+'</th>\
	</tr>\
	';
	$('#'+div+' thead').append(tr);
    }else{
        tr = '\
	<tr '+invalid_data+'>\
	    <td>'+data.asset_name+'</th>\
	    <td>'+data.asset_type+'</th>\
	    <td>'+data.description+'</th>\
	<tr>\
	';
	$('#'+div+' tbody').append(tr);
    }

}
function get_shot_row_csv(idx,data,div){
    tr = '';
    invalid_data = 'data-invalid="0"';
    if (data.invalid == 1){
        invalid_data = 'style="background-color:#ed4343;color:black" data-invalid="1"';
    }

    if (idx == 0){
        tr = '\
	<tr>\
	    <th>'+data.shot_name+'</th>\
	    <th>'+data.start_frame+'</th>\
	    <th>'+data.end_frame+'</th>\
	    <th>'+data.description+'</th>\
	</tr>\
	';
	$('#'+div+' thead').append(tr);
    }else{
        tr = '\
	<tr '+invalid_data+'>\
	    <td>'+data.shot_name+'</th>\
	    <td>'+data.start_frame+'</th>\
	    <td>'+data.end_frame+'</th>\
	    <td>'+data.description+'</th>\
	<tr>\
	';
	$('#'+div+' tbody').append(tr);
    }

}

$('#create_asset_build_csv').click(function(){

    data_list = [];
    $("#csv_asset_builds tr[data-invalid='0']").each(function(index){
	td_array = {};
	asset_build_name = $(this).find('td:eq(0)').text().trim();
	asset_build_type = $(this).find('td:eq(1)').text().trim();
	desc = $(this).find('td:eq(2)').text().trim();
    parent_id = get_parent_id();
	td_array['parent_id'] = parent_id;
	td_array['parent_object'] = get_parent_object();
	td_array['asset_build_name'] = asset_build_name;
	td_array['asset_build_type'] = asset_build_type;
	td_array['description'] = desc;

	data_list.push(td_array);
    });
    if (data_list.length > 0)
	var entity_name = 'AssetBuild';
	update_form_data(entity_name,data_list);
	$('#table_view').empty();

	$('#assetModal').modal('hide');
	clear_asset_modal_fields();

    window.setTimeout(function(){
        get_asset_details();
    }, 3000);
});

$('#btn_create_shot_csv').click(function(){

    data_list = [];
    $("#csv_shots tr[data-invalid='0']").each(function(index){
	td_array = {};
	shot_name = $(this).find('td:eq(0)').text().trim();
	start_frame = $(this).find('td:eq(1)').text().trim();
	end_frame = $(this).find('td:eq(2)').text().trim();
	desc = $(this).find('td:eq(3)').text().trim();

    parent_id = get_parent_id();
	td_array['parent_id'] = parent_id;
	td_array['parent_object'] = get_parent_object();
	td_array['shot_name'] = shot_name;

	td_array['start_frame'] = start_frame;
	td_array['end_frame'] = end_frame;
	td_array['description'] = desc;

	data_list.push(td_array);
    });
    if (data_list.length > 0)
	var entity_name = 'Shot';
	update_form_data(entity_name,data_list);
	$('#table_view').empty();

	$("#shotModal").modal("hide");
    clear_shot_modal_fields();
    window.setTimeout(function(){
        get_shot_details();
    }, 3000);
});

/*
    Author Kunal Jamdade
*/
function create_project_click(){

    clear_project_fields();
    $("#id_project_name").prop("disabled", false);
//    $('#id_project_code').prop("disabled", false);
    $("#update_details").prop("disabled", true);
    $("#update_details").hide();
    $("#submit_details").show();
    $('#projectModal').modal('toggle');
}

/*
    Modal options to display the div
    on click More, Storage, Project Config
*/
/*
================> Project Modal <=======================
*/

// More Option

/*$('.modal-body #a_collapse_more').click(function(){
    $('#collapse_more').toggle();
});*/

// Storage Option
$('#a_collapse_storage').click(function(){
   // $('#collapse_storage').toggle();

   if($("#collapse_storage").css('display') == 'none')
        $("#collapse_storage").show();
    else
        $("#collapse_storage").hide();

});

// Project Config Option
$('#a_project_config').click(function(){
   // $('#collapse_project_config').toggle();

   if($("#collapse_project_config").css('display') == 'none')
        $("#collapse_project_config").show();
    else
        $("#collapse_project_config").hide();

});

/*
===============> Sequence Modal <=====================
*/

// More Option
$('#a_collapse_sequence_more').click(function(){
    //$('#collapse_sequence_more').toggle();

    if($("#collapse_sequence_more").css('display') == 'none')
        $("#collapse_sequence_more").show();
    else
        $("#collapse_sequence_more").hide();

});

// Project Config
$('#a_collapse_sequence_project').click(function(){
    //$('#collapse_sequence_project_config').toggle();

    if($("#collapse_sequence_project_config").css('display') == 'none')
        $("#collapse_sequence_project_config").show();
    else
        $("#collapse_sequence_project_config").hide();

});

/*
===============> Shot Modal <=====================
*/

// More Option
$('#a_collapse_shot_more').click(function(){
    //$('#collapse_shot_more').toggle();

    if($("#collapse_shot_more").css('display') == 'none')
        $("#collapse_shot_more").show();
    else
        $("#collapse_shot_more").hide();
});

// Config Option
$('#a_collapse_shot_project').click(function(){
   //$('#collapse_shot_project_config').toggle();

   if($("#collapse_shot_project_config").css('display') == 'none')
        $("#collapse_shot_project_config").show();
    else
        $("#collapse_shot_project_config").hide();
});

/*
==============> Asset Modal <===================
*/
//More Option
$("#a_collapse_asset_more").click(function(){
    //$("#collapse_asset_more").toggle();

    if($("#collapse_asset_more").css('display') == 'none')
        $("#collapse_asset_more").show();
    else
        $("#collapse_asset_more").hide();
});

//Config Option
$("#a_collapse_asset_project").click(function(){
    //$("#collapse_shot_asset_config").toggle();

    if($("#collapse_shot_asset_config").css('display') == 'none')
        $("#collapse_shot_asset_config").show();
    else
        $("#collapse_shot_asset_config").hide();
});

/*
================> Task Modal <==================
*/
//More Option
$("#a_collapse_task_more").click(function(){
    //$("#collapse_task_more").toggle();
    if($("#collapse_task_more").css('display') == 'none')
        $("#collapse_task_more").show();
    else
        $("#collapse_task_more").hide();
});

//Config Option
$("#a_collapse_task_project_config").click(function(){
    $("#collapse_task_project_config").toggle();
});

/*
    Cancel Modal events of
    Project, Sequence & Shot
    and Nullifying the fields
*/

// hiding Project modal on cancel
$("#cancel_project_details").click(function(e){
    //$(this).closest('div modal fade').
    $('#projectModal').modal('hide');
    $("#collapse_storage").hide();
    $("#collapse_project_config").hide();
    clear_project_fields();
});

//hiding project modal on update
/*$("#update_details").click(function(){

});*/

function hide_project_modal(){
    $('#projectModal').modal('hide');
    $("#collapse_storage").hide();
    $("#collapse_project_config").hide();
    clear_project_fields();
}

//clear project modal fields
function clear_project_fields(){
    $('#id_project_name').val('');
    $('#id_project_code').val('');
    $('#id_start_date').val('');
    $('#id_end_date').val('');
    $('#id_scope').val('');
    $('#id_disk').val('');
    $('#id_project_folder').val('');
    $('#id_entity_name').val('');
    $('#id_resolution').val('');
    $('#id_start_frame').val('101');
    $('#id_fps').val('24');
    $('#id_version').val('');
    $('#id_client_label').val('');
}

// hiding Sequence Modal on cancel
$("#cancel_sequence_details").click(function(e){
    $('#sequenceModal').modal('hide');
    $("#collapse_sequence_more").hide();
    $("#collapse_sequence_project_config").hide();
    clear_sequence_fields();

});
//to clear sequence modal fields
function clear_sequence_fields(){
    $('#id_sequence_name').val('');
    $('#id_sequence_description').val('');
    $('#id_sequence_status').val("Select Status")
    $('#id_sequence_priority').val('');
    $('#id_sequence_entity_name').val('');
}


// hiding Shot Model on cancel
$('#cancel_shot_details').click(function(){
    $('#shotModal').modal('hide');
    $("#collapse_shot_more").hide();
    $('#collapse_shot_project_config').hide();
    clear_shot_modal_fields();
});



function clear_shot_modal_fields(){
    $('#id_shot_type').val('Static Shot');
    $('#id_name').val('');
    $('#id_description').val('');
    $('#id_status').val('Not Started');
    $('#id_priority').val('None');
    $('#id_frame_start').val('101');
    $('#id_frame_end').val('100');
    $('#id_total_frames').val('0.0');
    $('#id_frame_duration').val('0.0');
    $('#id_key_frames').val('');
    $('#attached_csv_file').html('');
    remove_rows('#csv_shots');
}

//on click cancel hide asset modal
$("#cancel_asset_details").click(function(){
    $("#assetModal").modal('hide');
    $("#collapse_asset_more").hide();
    $("#collapse_shot_asset_config").hide();
    clear_asset_modal_fields();
});
function asset_type_drop_down(){

    var s = $("#id_asset_type");
    s.append("<option values='Select Asset' selected='selected'> Select Asset </option>");
    s.append("<option value='Set'>Set</option>");
    s.append("<option value='Vehicle'>Vehicle</option>");
    s.append("<option value='Prop'>Prop</option>");
    s.append("<option value='Character'>Character</option>");
}

function clear_asset_modal_fields(){
    //$("#id_asset_type option:eq(0)").attr("selected", true);
    $("#id_asset_type").empty();
    asset_type_drop_down();
    $("#id_asset_name").val('');
    $("#id_asset_description").val('');
/*    $('#attached_csv_file').html('');
    remove_rows('#csv_asset_builds');*/
}

/*
    keypress event on project name
    to fill project code
*/
var cnt = 1;
var max = $('#id_project_code').attr("maxlength");
var pattern_name = /^[0-9a-zA-Z]+$/;

$('#id_project_name').keyup(function(){
    var $this = $(this);
    var nm = $('#id_project_name').val();
    window.setTimeout(function() {
        len = $('#id_project_name').val().length;
        if (!pattern_name.test(nm)){
            error_message("No special characters allowed");
            $('#id_project_code').val('');
            $('#id_project_name').val('');
            $("#projectModal").modal("hide");
        }
        if (digit_pattern.test(nm)){
            error_message("Only digits are not allowed");
            $('#id_project_code').val('');
            $('#id_project_name').val('');
            $("#projectModal").modal("hide");
        }
        if(len > 0 && len <= max){
            $('#id_project_code').val($this.val().toLowerCase());
        }
        else{
            $('#id_project_code').prop("disabled", true);
        }
    }, 0);
});
var res_pattern = /^[0-9X0-9]+$/;
$("#id_resolution").focusout(function(){
    var inp = $("#id_resolution").val();
//    alert(inp.toUpperCase());
    if (!res_pattern.test(inp.toUpperCase())){
        error_message("Only capital 'X' is allowed");
        clear_project_fields();
        $("#projectModal").modal("hide");
    }
});

// Ajax call to create project
$('#submit_details').click(function(){

    var project_name = $('#id_project_name').val().trim().toUpperCase();
    var project_code = $('#id_project_code').val().trim();
    var start_date = $('#id_start_date').val();
    var end_date = $('#id_end_date').val();
    var workflow_schema = $('#id_workflow_schema').val();
    var status = $('#id_status').val();
    var scope = $('#id_scope').val();
    var disk = $('#id_disk').val();
    var project_folder = $('#id_project_folder').val();
    var entity_name = $('#id_entity_name').val();
    var resolution = $('#id_resolution').val().toUpperCase();
    var start_frame = $('#id_start_frame').val();
    var fps = $('#id_fps').val();
    var version = $('#id_version').val();
    var client_label = $('#id_client_label').val();
    var flag_status = 'create';

    var data_array = {};

    if(project_name == ''){
        error_message("project name field must not be empty");
        return false;
    }
    
    var pattern_name = /^[0-9a-zA-Z]+$/;
    if(!pattern_name.test(project_name)){
        error_message("Project name must be alphanumeric");
        return false;
    }
    data_array['project_name'] = project_name;

    if(project_code == ''){
        error_message("project code field must not be empty");
        return false;
    }
    var pattern = /^[0-9a-zA-Z]+$/;
    if(!pattern.test(project_code)){
        error_message("Project code must contain alphabets and numbers");
        return false;
    }
    data_array['project_code'] = project_code;

    var fps_pattern = /^[0-9]+$/;
    if(!fps_pattern.test(fps)){
        error_message("Fps must be integer only");
        return false;
    }
    if(!fps_pattern.test(start_frame)){
        error_message("Start frame must be integer");
        return false;
    }
    data_array['fps'] = fps;


    if(start_date == '' && end_date == ''){
        error_message("Start and end date must not be empty");
        return false;
    }

    if(start_date == ''){
        error_message("start date field must not be empty");
        return false;
    }

    if(end_date == ''){
        error_message("end date field must not be empty");
        return false;
    }
    //return false;
    var edate = new Date(end_date);
    var sdate = new Date(start_date);

    if(sdate > edate){
        error_message("Start date must not exceed end date");
        return false;
    }
    data_array['start_date'] = start_date;
    data_array['end_date'] = end_date;
    data_array['start_frame'] = start_frame;
    data_array['resolution'] = resolution;
    var data_list = [];
    data_list.push(data_array);

    var entity_name = 'Project'
//    else{

    update_form_data(entity_name,data_list);
    $('#table_view').empty();
    window.setTimeout(function(){
        get_project_details();
    }, 3000);

/*
        $.ajax({
            type: "POST",
            url: "/callajax/",
            data : {'object_name': 'Project_Creation',
            'project_name': project_name,
            'project_code': project_code,
            'start_date': start_date,
            'end_date': end_date,
            'workflow_schema': workflow_schema,
            'status': status,
            'scope': scope,
            'disk': disk,
            'entity_name': entity_name,
            'resolution': resolution,
            'start_frame': start_frame,
            'fps': fps,
            'version': version,
            'client_label': client_label,
            'project_folder': project_folder,
            'flag_status': flag_status,
            },
            success: function(json){
            noty({
                text: 'Project ['+project_code+'] Created Successfully.',
                layout: 'topCenter',
                closeWith: ['click', 'hover'],
                type: 'success'
            });
                $('#table_view').empty();
                get_project_details();
            }
        });//end of ajax call
*/
//    }
    hide_project_modal();
});// end of create project details function

function update_form_data(entity_name,data_list){

    object_name = 'Update Form Data';
    data_list = JSON.stringify(data_list);
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 
	    'object_name': object_name, 
	    'data_list': data_list, 
	    'entity_name': entity_name},
        beforeSend: function(){
	    $('.modal-header').plainOverlay('show');
        },
        success: function(json){
        
	    $('.modal-header').plainOverlay('hide');
	        if (json.message){
                noty({
                    text: json.message,
                    layout: 'topCenter',
                    closeWith: ['click', 'hover'],
                    type: 'success',
                    timeout: 1000
                });
            }
                //$('#table_view').empty();
                /*if (entity_name == 'Task')
                    get_task_details(get_project_name(), get_task_name, entity_name);*/
                /*if (entity_name == 'Sequence'){
//                    $('#table_view').empty();
                    get_sequence_details();
                }
                if (entity_name == 'Shot'){
                    $('#table_view').empty();
                    get_shot_details();
                }
                if (entity_name == 'Project'){
                    $('#table_view').empty();
                    get_project_details();
                }*/
                /*if (entity_name == 'AssetBuild'){
                    $('#table_view').empty();
                    get_asset_details();
                }*/
        },
        error: function(error){
            console.log("Error:");
            console.log(error);
        }

    });

}


// Ajax to call to update project
$('#project_id #id_project_code').prop('disabled', true);

$("#update_details").click(function(){

    var project_name = $('#project_id #id_project_name').val();
    var project_code = $('#project_id #id_project_code').val();
    var project_id = $('#project_id #id_project_code').attr('data-id');
    var start_date = $('#project_id #id_start_date').val();
    var end_date = $('#project_id #id_end_date').val();
    var workflow_schema = $('#project_id #id_workflow_schema').val();
    var status = $('#project_id #id_status').val();
    var scope = $('#project_id #id_scope').val();
    var disk = $('#project_id #id_disk').val();
    var project_folder = $('#project_id #id_project_folder').val();
    var entity_name = $('#project_id #id_entity_name').val();
    var resolution = $('#project_id #id_resolution').val();
    var start_frame = $('#project_id #id_start_frame').val();
    var fps = $('#project_id #id_fps').val();
    var version = $('#project_id #id_version').val();
    var client_label = $('#project_id #id_client_label').val();
    var flag_status = 'Update';

    var data_array = {};
    if (!project_id){
	alert("Invalid project to update ...");
	return False;
    }

    var sdate = new Date(start_date);
    var edate = new Date(end_date);
    if (sdate > edate){
        error_message("start date must not exceed end date");
        return false;
    }
    if(start_date == '' || end_date == ''){
        error_message("start or end date field must not be empty");
        return false;
    }
    if(end_date == '' && start_date == ''){
        error_message("Date fields must not be blank");
        return false;
    }
    data_array['project_id'] = project_id;
    data_array['start_date'] = start_date;
    data_array['end_date'] = end_date;
    data_array['resolution'] = resolution;
    data_array['start_frame'] = start_frame;
    data_array['fps'] = fps;

    var data_list = [];
    data_list.push(data_array);

    var entity_name = 'Project';

    update_form_data(entity_name,data_list);
    $('#table_view').empty();

    hide_project_modal();
    window.setTimeout(function(){
        get_project_details();
    }, 3000);
/*
    else{
        $.ajax({
            type: "POST",
            url: "/callajax/",
            data : {'object_name': 'Project_Creation',
            'project_name': project_name,
            'project_code': project_code,
            'start_date': start_date,
            'end_date': end_date,
            'workflow_schema': workflow_schema,
            'status': status,
            'scope': scope,
            'disk': disk,
            'entity_name': entity_name,
            'resolution': resolution,
            'start_frame': start_frame,
            'fps': fps,
            'version': version,
            'client_label': client_label,
            'project_folder': project_folder,
            'flag_status': flag_status
            },
            success: function(json){
                alert("successfully updated project!!!!");
                get_project_details();
            }
        });//end of ajax call
        hide_project_modal();
    }
*/
});

$("#id_sequence_name").focusout(function(){
     var sequence_name = $('#id_sequence_name').val().trim();
     flg = 0;
     if (!pattern_name.test(sequence_name)){
        error_message("Must be Alphanumeric Only")
        flg = 1;
     }
     if (sequence_name == ''){
        error_message("Sequence Name must not be empty")
        flg = 1;
     }

    var prj_name = $("#id_sequence_parent_object_type").val().trim();
    console.log(prj_name);
    $.ajax({
        type: "POST",
        url:"/callajax/",
        data:{
            "object_name": "Duplicate_name_check",
            'prj': prj_name,
            'name': sequence_name,
            'flag': 'seq_name'
        },
        success: function(json){
            var s = JSON.stringify(json);
            if (s == 'true'){
                error_message("Sequence already exists");
                $("#sequenceModal").modal("hide");
                clear_sequence_fields();
            }
            if (s == 'false'){
                $("#submit_sequence_details").removeAttr("disabled");
            }
        }
    });

     /*if (flg == 1){
        clear_sequence_fields();
        $('#sequenceModal').modal('hide');
     }*/
});
//Ajax call to create sequence
$('#submit_sequence_details').click(function(){

    var parent_object_type = $('#id_sequence_parent_object_type').val();
    var task_template = $('#id_sequence_task_template').val();
    var sequence_type = $('#id_sequence_type').val();
    var sequence_name = $('#id_sequence_name').val().trim();
    var description = $('#id_sequence_description').val();
    var status = $('#id_sequence_status option:selected').text().trim();
    var priority = $('#id_sequence_priority').val();
    var scope = $('#id_sequence_scope').val();
    var entity_name = $('#id_sequence_entity_name').val();
    var version = $('#id_sequence_version').val();
    var prj_name = parent_object_type;
    var flag_status = 'create';

    var pattern = /^[0-9a-zA-Z]+$/;
    if(!pattern.test(sequence_name)){
        alert("Sequence must contain alphabets or numbers!!!");
        return false;
    }
    if(sequence_name == ""){
        alert("Sequence name cannot be empty!!!");
        return false;
    }
    if (status == 'Select Status'){
        alert("Please select proper status!!!");
        return false;
    }
    var data_array = {};
    data_array['parent_id'] = get_parent_id();
    data_array['parent_object'] = get_parent_object();
    data_array['seq_name'] = sequence_name;
    
    data_array['description'] = description;

    var data_list = [];
    data_list.push(data_array);

    var entity_name = 'Sequence';

    update_form_data(entity_name,data_list);
    $('#table_view').empty();

    $('#sequenceModal').modal('hide');
    window.setTimeout(function(){
        get_sequence_details();
    }, 3000);
/*
    else{
        $.ajax({
            type: "POST",
            url: "/callajax/",
            data : {'object_name': 'Sequence_Creation',
            'parent_object_type': parent_object_type,
            'task_template': task_template,
            'sequence_type': sequence_type,
            'sequence_name': sequence_name,
            'description': description,
            'assigned_users': '',
            'status': status,
            'priority': priority,
            'scope': scope,
            'entity_name': entity_name,
            'version': version,
            'prj_name': prj_name,
            'flag_status': flag_status
            },
            success: function(json){
            noty({
                text: 'Sequence ['+sequence_name+'] Created Successfully.',
                layout: 'topCenter',
                closeWith: ['click', 'hover'],
                type: 'success'
            });
                $('#table_view').empty();
                get_sequence_details();
            }
        });//end of ajax call
        $('#sequenceModal').modal('hide');
        $("#table_view").show();
    }
*/
});// end of create sequence function

$('#id_frame_end').change(function(){

    var sf = $('#id_frame_start').val();
    var ef = $('#id_frame_end').val();
    var linked_to = $('#id_parent_object_type').val();
    var prj_name = get_project_name();
    var seq_name = get_sequence_name();
    console.log(sf +"====>"+ parseInt(ef));

    calculate_fps(sf, ef, prj_name, seq_name);
});
/*
 *  fps calculation and append
 *  frame duration.
 */
function calculate_fps(sf, ef, prj_name, seq_name){   
     
    $("#id_total_frames").val(parseInt(ef) - (parseInt(sf) - 1));

    $.ajax({
        type:"POST",
        url:"/callajax/",
        data:{
        'object_name':'fps_calculation',
        'sf':sf,
        'ef':ef,
        'prj_name': prj_name,
        'seq_name': seq_name
        },
        success: function(json){

            $("#id_frame_duration").val(json + "sec");
        }
    });
}

$("#id_name").focusout(function(){

    var parent_object_type = $('#id_parent_object_type').val();
    var split_prj_seq = parent_object_type.split(':');
    var prj_name =  split_prj_seq[0].trim();
    var sequence_name = split_prj_seq[1].trim();
    var shot_name = $("#id_name").val().trim();
    console.log(prj_name+"\n"+sequence_name);
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data:{
            "object_name": 'Duplicate_name_check',
            'prj': prj_name,
            'name': shot_name,
            'seq': sequence_name,
            'flag':'shot_name'
        },
        success: function(json){
               var s = JSON.stringify(json);
               if (s == 'true'){
                    error_message("Shot Already Exists");
                    $("#submit_shot_details").prop("disabled", true);
                    $("#shotModal").modal("hide");
                    clear_shot_modal_fields();
                }
               if (s == 'false')
                    $("#submit_shot_details").removeAttr("disabled");
        }
    });
});

//Ajax call to create shot
$('#submit_shot_details').click(function(){

    var parent_object_type = $('#id_parent_object_type').val();
    var task_template = $('#id_task_template').val();
    var shot_type = $('#id_shot_type').val();
    var name = $('#id_name').val().trim();
    var description = $('#id_description').val();

    var status = $('#id_status').val();
    var priority = $('#id_priority').val();
    var scope = $('#id_scope').val();
    var entity_name = $('#id_entity_name').val();
    var version = $('#id_version').val();
    var frame_start = $('#id_frame_start').val();
    var frame_end = $('#id_frame_end').val();

    var key_shot = '';

    var key_frames = $('#id_key_frames').val();
    var frame_handles = $('#id_frame_handles').val();
    var split_prj_seq = parent_object_type.split(':');
    var prj_name =  split_prj_seq[0]
    var sequence_name = split_prj_seq[1];
    var flag_status = 'create';


    var pattern = /^[0-9a-zA-Z]+$/;
    if(!pattern.test(name)){
        alert("Shot name must be alphanumeric!!!!");
        return false;
    }
    if(name == ''){
        alert("Shot name must not be empty!!!!!");
        return false;
    }
    if (status == 'Select Status'){
        alert("Select proper status!!!!!");
        return false;
    }
    if(frame_end <= frame_start){
        alert("End frame must be higher than start frame!!!!");
        return false;
    }
    if(frame_start == ''){
        alert("Start frame cannot be empty!!!!");
        return false;
    }
    var data_array = {};
    data_array['parent_id'] = get_parent_id();
    data_array['parent_object'] = get_parent_object();
    data_array['shot_name'] = name;
    data_array['shot_type'] = shot_type;
    data_array['description'] = description;
    data_array['start_frame'] = frame_start;
    data_array['end_frame'] = frame_end;

    var data_list = [];
    data_list.push(data_array);

    var entity_name = 'Shot';

    update_form_data(entity_name,data_list);
    $('#table_view').empty();

    $('#shotModal').modal('hide');
    clear_shot_modal_fields();
    window.setTimeout(function(){
        get_shot_details();
    }, 3000);
/*
    else{
        $.ajax({
            type: "POST",
            url: "/callajax/",
            data : {'object_name': 'Shot_Creation',
            'parent_object_type': parent_object_type,
            'task_template': task_template,
            'shot_type': shot_type,
            'name': name,
            'description': description,
            //'assigned_users': '',
            'status': status,
            'priority': priority,
            'scope': scope,
            'entity_name': entity_name,
            'version': version,
            'frame_start': frame_start,
            'frame_end': frame_end,
            'key_shot': key_shot,
            'key_frames': key_frames,
            'frame_handles': frame_handles,
            'prj_name': prj_name,
            'sequence_name': sequence_name,
            'flag_status': flag_status
            },
            success: function(json){
            noty({
                text: 'Shot ['+name+'] Created Successfully.',
                layout: 'topCenter',
                closeWith: ['click', 'hover'],
                type: 'success'
            });
                $('#table_view').empty();
                get_shot_details();
            }
        });//end of ajax call
        $('#shotModal').modal('hide');
        clear_shot_modal_fields();
    }
*/
});// end of create asset function

var pattern = /^[0-9a-zA-Z]+$/;
var digit_pattern = /^[0-9]+$/;
/*if(asset_name == ""){
    error_message("Asset name must not be empty");
    return false;
}*/
$('#id_asset_name').focusout(function(){
    asset_name = $('#id_asset_name').val().trim();
    console.log(asset_name);
    if(!pattern.test(asset_name)){
        error_message("Asset Name must contain alphabets");
        $('#id_asset_name').val('');
        $('#assetModal').modal('hide');
        return false;
    }
    if (!pattern.test(asset_name)){
        error_message("Only digits are not allowed");
        $('#id_asset_name').val('');
        $('#assetModal').modal('hide');
        return false;
    }
    asset_name_check(asset_name);
});
//Ajax call to create asset
$('#submit_asset_details').click(function(){

    var asset_type = $('#id_asset_type option:selected').text().trim();
    var asset_name = $('#id_asset_name').val();
    var asset_desc = $('#id_asset_description').val();
    var asset_status = $('#id_asset_status').val();
    var asset_priority = $('#id_asset_priority').val();
    var asset_entity_name = $('#id_asset_entity_name').val();
    var asset_version = $('#id_asset_version').val();
    var asset_client_label = $('#id_asset_client_label').val();
    //var asset_sub_category = $('#id_asset_sub_category').val();
    //console.log(asset_sub_category);
    var prj_name =  $("#id_linked_to").val();
    var flag_status = 'create';


    var data_array = {};
    data_array['parent_id'] = get_parent_id();
    data_array['parent_object'] = get_parent_object();
    data_array['asset_build_name'] = asset_name;
    data_array['asset_build_type'] = asset_type;
    data_array['description'] = asset_desc;

    var data_list = [];
    data_list.push(data_array);

    var entity_name = 'AssetBuild';

    update_form_data(entity_name,data_list);
    $('#table_view').empty();
    $('#assetModal').modal('hide');
    clear_asset_modal_fields();
    window.setTimeout(function(){
        get_asset_details();
    }, 3000);
/*
    else{
        $.ajax({
            type: "POST",
            url: "/callajax/",
            data : {'object_name': 'Asset_Creation',
            'asset_type': asset_type,
            'asset_name': asset_name,
            'asset_desc': asset_desc,
            'asset_status': asset_status,
            'asset_priority': asset_priority,
            'asset_entity_name': asset_entity_name,
            'asset_version': asset_version,
            'asset_client_label': asset_client_label,
            'asset_sub_category': '',
            'prj_name': prj_name,
            'flag_status': flag_status
            },
            success: function(json){
            noty({
                text: 'Asset Build ['+asset_name+'] Created Successfully.',
                layout: 'topCenter',
                closeWith: ['click', 'hover'],
                type: 'success'
            });
                $('#table_view').empty();
                get_asset_details();
            }
        });//end of ajax call
        $('#assetModal').modal('hide');

        clear_asset_modal_fields();
    }
*/
});// end of create shot function

/*
    function to get the
    asset details
*/
function get_asset_details(){
    $("#previous_div").show();
//    $('.sidebar-nav').hide();
    $.ajax({
        type: "POST",
        url: "/callajax/",
        data :{
        "object_name" : "display_asset_details",
        "project_name": get_project_name()
        },
        beforeSend: function(){
            $("#table_view").empty();
            create_table_display_details(type='asset');
        },
        success: function(json){
            var table = $('#project_table');
                $.each(json, function(idx, data){
                    var row = $('<tr id="'+data.ftrack_id+'" data-object="AssetBuild">');
                    row.append("<td>" + data.name + "</td>");
                    row.append("<td>" + data.description + "</td>");
                    row.append("<td>" + data.type + "</td>");
                    row.append("<td>"
                    +"<button class='btn btn-xs btn-primary' type='button' onclick='create_tasks(this)'>Create Task</button>&nbsp;&nbsp;"
                    +"<button class='btn btn-xs btn-success' type='button' onclick='update_assets(this)'>Update</button>&nbsp;&nbsp;"
                    +"<button class='btn btn-xs btn-info' type='button' onclick='view_tasks(this)'>View Task</button>"
                    +"</td>");
                    table.append(row);
            });// end of each loop
            $("#table_view").append(table);
        }
    });
}
function update_assets(name){
    var asset_name = $(name).closest('tr').find('td:eq(0)').text();
    var prj_name = get_project_name();
    var entity_id = $(name).closest('tr').attr('id');
    $("#id_linked_to").val(prj_name);
    $("#id_linked_to").prop("disabled", true);
    $('#id_asset_name').prop("disabled", true);
    $('#id_asset_type').prop("disabled", true);
    get_details_before_update(prj_name, 'asset', '', '', asset_name, entity_id);
    $("#assetModal").modal("show");
    $("#submit_asset_details").hide();
    $("#update_asset_details").show();

    var asset_build_id = $(name).closest('tr').attr('id');
    var asset_build_object = $(name).closest('tr').attr('data-object');

    set_entity_name(asset_build_object);
    set_entity_id(asset_build_id);

    $("#create_asset_csv_label").css('display', 'none');
}
/*
    function to update asset details
*/

$("#update_asset_details").click(function(){

    var asset_type = $('#id_asset_type option:selected').text().trim();
    var asset_name = $('#id_asset_name').val().trim();
    var asset_desc = $('#id_asset_description').val();
    var asset_status = $('#id_asset_status').val();
    var asset_priority = $('#id_asset_priority').val();
    var asset_entity_name = $('#id_asset_entity_name').val();
    var asset_version = $('#id_asset_version').val();
    var asset_client_label = $('#id_asset_client_label').val();

    /*if (asset_type != 'Character')
        asset_sub_category = $("#asset_subCat").val().trim();
    else
        asset_sub_category = $("#id_asset_type option:selected").text().trim();

    console.log(asset_sub_category);*/

    // var asset_sub_category = $('#id_asset_sub_category').val();

    var prj_name =  $("#id_linked_to").val();
    var flag_status = 'update';
    if(asset_name == ""){
        alert("Asset name must not be empty!!!!");
        return false;
    }
    var pattern = /^[0-9a-zA-Z]+$/;
    if(!pattern.test(asset_name)){
        alert("Asset name must contain alphanumeric character!!!!");
        return false;
    }
    var data_array = {};
    data_array['parent_id'] = get_parent_id();
    data_array['parent_object'] = get_parent_object();
    data_array['asset_build_id'] = get_entity_id();
    data_array['asset_build_object'] = get_entity_name();
    
    data_array['description'] = asset_desc;

    var data_list = [];
    data_list.push(data_array);

    var entity_name = 'AssetBuild';

    update_form_data(entity_name,data_list);
    $('#table_view').empty();
    //get_asset_details();
    clear_asset_modal_fields();
    $('#assetModal').modal('hide');
    $('#id_asset_name').removeAttr("disabled");
    $('#id_asset_type').removeAttr("disabled");
    window.setTimeout(function(){
        get_asset_details();
    }, 3000);
/*
    else{
        $.ajax({
            type: "POST",
            url: "/callajax/",
            data : {'object_name': 'Asset_Creation',
            'asset_type': asset_type,
            'asset_name': asset_name,
            'asset_desc': asset_desc,
            'asset_status': asset_status,
            'asset_priority': asset_priority,
            'asset_entity_name': asset_entity_name,
            'asset_version': asset_version,
            'asset_client_label': asset_client_label,
            'asset_sub_category': '', //asset_sub_category,
            'prj_name': prj_name,
            'flag_status': flag_status
            },
            beforeSend: function(){
                $('#table_view').empty();
            },

            success: function(json){
                alert("successfully updated asset!!!!");
            }
        });//end of ajax call
        get_asset_details();
        clear_asset_modal_fields();
        $('#assetModal').modal('hide');
        $('#id_asset_name').removeAttr("disabled");
        $('#id_asset_type').removeAttr("disabled");
    }
*/
});

/*
    on key press to fill the task name
*/
$("#id_task_start_date").css('display','block');

$("#id_task_bid_days").change(function(){

    var v = $("#id_task_bid_days").val().trim();
    if ($("#id_task_start_date").val() != ''){
        bool_val = check_bid_days(v);
        assign_end_date_bid_days_start_date(v, $("#id_task_start_date").val());
    }
    else{
        bool_val = check_bid_days(v);
    }
});

/*
 *     function to check bid_days
 */
function check_bid_days(bid_days){

    if (!isNaN(parseFloat(bid_days))){
        if(parseInt(bid_days.indexOf(".")) != -1){
            var len = bid_days.toString();
            len = len.split(".")[1].length;
            if (len > 2){
                error_message("Only 2 decimal allowed");
                $("#taskModal").modal("hide");
                clear_task_fields();
                $("#id_task_start_date").hide();
                return false;
            }
            else
            {
                $("#id_task_start_date").css("display", "block");
                return true;
            }
        }
        else{
            var int_str = bid_days.toString();
            if (int_str.length > 2){
                error_message("Only 2 digits allowed");
                $("#taskModal").modal("hide");
                clear_task_fields();
                $("#id_task_start_date").hide();
            }
            else{
                $("#id_task_start_date").css("display", "block");
                return true;
            }
        }
    }
    else{
        $("#id_task_start_date").css("display", "none");
        error_message("Only numbers are allowed");
         $("#taskModal").modal("hide");
        clear_task_fields();
        return false;
    }
}

/*
 *     function to print error messages
 */
function error_message(error_msg){
    $.notify(error_msg + "!!!!",
    {
        position:"top center",
        autoHide: true,
        autoHideDelay: 1000
    });
}


/* on key change event to fill in
   the due date based on bid days
 */
$("#id_task_start_date").on("change", function(){

    var bid_days = $("#id_task_bid_days").val();
    var sval = $("#id_task_start_date").val();

    assign_end_date_bid_days_start_date(bid_days, sval);

});// end of key press event on bid days

function assign_end_date_bid_days_start_date(bid_days, sval){

    var sdate = new Date(sval);

    var dd = parseInt(sdate.getDate() + parseFloat(bid_days));
    var mm = sdate.getMonth() + 1;
    var yy = sdate.getFullYear();

    if (bid_days >= 1)
        dd -= 1;
    else
        dd = dd

    var temp_date = new Date(yy,mm,0);

    if (dd > temp_date.getDate()){
        dd -= temp_date.getDate();
        console.log("____"+dd);
        mm += 1;
    }
    var s = "0" + mm + "/" + dd + "/" + yy;
    var n = new Date(s)
    console.log("<======>" + n);
    var nm = (n.getMonth() + 1);
    var nd = n.getDate();
    if (nm < 10)
        nm = "0" + nm;
    if (nd < 10)
        nd = "0" + nd;

    $("#id_task_due_date").val(n.getFullYear() + "-"+ nm + "-"+ nd).prop("disabled", true);
//    val(nm + "/" + nd + "/" + n.getFullYear()).prop("disabled", true);
    return false;
}
/*
    onchange event
    on select to check
    task exists
*/

$("#id_task_name").change(function(){

    var val = $("#id_task_name option:selected").text().trim();
    console.log(val);
    var th = get_table_header();
    console.log(th);
    var result = $("#id_task_name");
    if (th == "Sequence" ){
        var linked = $("#id_task_linked_to").val().trim().split(":");
        var prj_name = linked[0].trim();
        var seq_name = linked[1].trim();

    }
    if (th == "Shot"){
        var linked = $("#id_task_linked_to").val().trim().split(":");
        var prj_name = linked[0].trim();
        var seq_name = linked[1].trim();
        var shot_name = linked[2].trim();
    }
    if (th == "Asset"){
        var linked = $("#id_task_linked_to").val().trim().split(":");
        var prj_name = linked[0].trim();
        var seq_name = linked[1].trim();
    }
    var s = '';
    $.ajax({
        type:"POST",
        url: "/callajax/",
        data :{
            'object_name': 'Duplicate_name_check',
            'name': val,
            'prj': prj_name,
            'seq': seq_name,
            'shot': shot_name,
            'flag': th + "_task"
        },
        success: function(json){
                //alert(json);
                check(json);
        }
    });
});
function check(data){
    //alert("in check" + data);
    s = JSON.stringify(data);
    if(s == 'false'){
        $("#submit_task_details").removeAttr("disabled");
    }
    if(s == 'true'){
        error_message("Task name already exists");
        $("#taskModal").modal("hide");
        clear_task_fields();
    }
}

/*
    on keypress of asset name
    to check asset exists
*/
function asset_name_check(asset_name){
//$("#id_asset_type").change(function(){
    var prj_name = $("#id_linked_to").val().trim();
    var asset_type = $("#id_asset_type option:selected").text().trim();
    console.log(prj_name+"\n"+asset_name);
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data:{
            "object_name": 'Duplicate_name_check',
            'prj': prj_name,
            'name': asset_name,
            'seq': asset_type,
            'flag':'asset_name'
        },
        success: function(json){
               var s = JSON.stringify(json);
               if (s == 'true'){
                    error_message("Asset Already Exists");
                    $("#submit_asset_details").prop("disabled", true);
                    $("#assetModal").modal("hide");
                    clear_asset_modal_fields();
                }
               if (s == 'false')
                    $("#submit_asset_details").removeAttr("disabled");
        }
    });
//});
}
/*
    on keypress of project name
    to check if project exists
    or not
*/
$("#id_project_name").focusout(function(){

    var prj_name = $("#id_project_name").val().trim();
    var prj_code = $("#id_project_code").val().trim();
    console.log(prj_name + "\t"+ prj_code);
    $.ajax({
        type: "POST",
        url:"/callajax/",
        data:{
            "object_name": "Duplicate_name_check",
            'prj': prj_code,
            'name': prj_code,
            'flag': 'prj_name'
        },
        success: function(json){
            var s = JSON.stringify(json);
            if (s == 'true'){
                error_message("Project Name already exists");
                $("#projectModal").modal("hide");
                clear_project_fields();
            }
            if (s == 'false'){
                $("#submit_details").removeAttr("disabled");
            }
        }
    });
});



/*
    function to submit
    task details on click
*/
$("#submit_task_details").click(function(){

    var task_type = $("#id_task_name option:selected").text().trim();
    //var task_name = $("#id_task_name").val().trim();
    var description = $("#id_task_description").val();
    var assignee = $("#id_task_assignee").val();

    var bid_days = $("#id_task_bid_days").val();
    var task_status = $("#id_task_status").val();

    var task_priority = $("#id_task_priority option:selected").val();
    var start_date = $("#id_task_start_date").val();
    var due_date = $("#id_task_due_date").val();
    var task_scope = $("#id_task_scope").val();
    var entity_name = $("#id_task_entity_name").val();
    var flag_status = 'create';
    var linked_to = $("#id_task_linked_to").val();
    var str = linked_to.split(":");
    var project_name = '';
    var sequence_name = '';
    var shot_name = '';
    var asset_name = '';

    var th = get_table_header().trim().split(" ")[0];
    if (th == 'Sequence'){
        project_name = str[0];
        sequence_name = str[1];
        //alert(sequence_name);
    }
    if (th == 'Shot'){
        project_name = str[0];
        sequence_name = str[1];
        shot_name = str[2];
        //alert(shot_name);
    }
    if (th == 'Asset'){
        project_name = str[0];
        asset_name = str[1];
        //alert("**************"+asset_name);
        set_asset_name(asset_name);
    }
    var sdate = new Date(start_date);
    var edate = new Date(due_date);

    if (task_type == 'Select Option'){
        alert("Select Valid Option!!!");
        return false;
    }
    if (assignee == 'Select Option'){
        alert("Select Assignee");
        return false;
    }
    if (bid_days == ''){
        alert("Bid Days must not be empty!!!");
        return false;
    }
    if (jQuery.isNumeric(bid_days) == 'false'){
        alert("bid days must be numeric!!!!");
        return false;
    }
//    if (sdate > edate){
//        alert("Start date must not exceed end date!!!!");
//        return false;
//    }
    if (start_date == '' && due_date == ''){
        alert("Date field must not be empty!!!!");
        return false;
    }
    
    bid_days = 60*60*10*bid_days

    var data_array = {};
    data_array['parent_id'] = get_parent_id();
    data_array['parent_object'] = get_parent_object();
    data_array['task_name'] = task_type;
    data_array['task_type'] = task_type;
    data_array['description'] = description;
    data_array['start_date'] = start_date;
    data_array['end_date'] = due_date;
    data_array['bid'] = bid_days;
    data_array['priority'] = task_priority;
    data_array['assignee'] = assignee;
    data_array['task_status'] = task_status;

    var data_list = [];
    data_list.push(data_array);

    var entity_name = 'Task';

    update_form_data(entity_name,data_list);

    $("#taskModal").modal("hide");
    clear_task_fields();
    window.setTimeout(function(){
        $('#table_view').empty();
        if (th == 'Sequence'){
            project_name = str[0];
            sequence_name = str[1];
            get_task_details(project_name, sequence_name, th);
        }
        if (th == 'Shot'){
            project_name = str[0];
            sequence_name = str[1];
            shot_name = str[2];
            get_task_details(project_name, sequence_name, shot_name, th);
        }
        if (th == 'Asset'){
            project_name = str[0];
            asset_name = str[1];
            set_asset_name(asset_name);
            get_task_details(project_name, asset_name, th);
        }
    }, 3000);
/*
    $.ajax({
        type: "POST",
        url: "/callajax/",
        data :{
        "object_name" : "Task_Creation",
        "task_type": task_type,
        "task_name": task_type,
        "description": description,
        "assignee": assignee,
        "bid_days": bid_days,
        "task_status": task_status,
        "task_priority": task_priority,
        "start_date": start_date,
        "due_date": due_date,
        "task_scope": task_scope,
        "entity_name": entity_name,
        "flag_status": flag_status,
        "project_name": project_name,
        "sequence_name": sequence_name,
        "shot_name": shot_name,
        "asset_name": asset_name,
        "type": th
        },
        success: function(json){
            alert("Successfully created tasks!!!!!");
            get_task_details(project_name, sequence_name, th);
        }
    });
    $("#taskModal").modal("hide");
    clear_task_fields();
*/
});

// hiding task modal on cancel
$("#cancel_task_details").click(function(){
    $("#taskModal").modal("hide");
    $("#collapse_task_more").hide();
    //$("#collapse_task_project_config").hide();
    clear_task_fields();
});

// clear task fields
function clear_task_fields(){
    $("#task_creation").get(0).reset();
//    $("#id_task_name").val('Select Option');
//    $("#id_task_description").val('');
//    $("#id_task_bid_days").val('');
//    $("#id_task_status").val('');
//    $("#id_task_priority").val("");
//    $("#id_task_start_date").val('');
//    $("#id_task_due_date").val('');
//    $("#id_task_scope").val('');
//    $("#id_task_entity_name").val('');
    //$("#id_task_name").val("");
}

/*
    function to get task
    details sequence/asset/shot wise
*/
function get_task_details(project_name, name, type){
    /*alert("seq_name" + name);
    alert("shot_name" + get_shot_name());
    alert("asset_name" + get_asset_name());*/
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data:{
            "object_name": "display_task_details",
            "project_name": project_name,
            "name": name,
            "type": type,
            "shot_name": get_shot_name(),
            "asset_name": get_asset_name()
        },
        beforeSend: function(){
            $("#table_view").empty();
            create_table_display_details(type_name='task');
        },
        success: function(json){
            var table = $('#project_table');
            $.each(json, function(idx, data){
                var row = $('<tr id="'+data.ftrack_id+'" data-object="Task">');
                    row.append("<td>" + data.name + "</td>");
                    row.append("<td>" + data.startdate + "</td>");
                    row.append("<td>" + data.enddate + "</td>");
                    row.append("<td>" + data.ftrack_status + "</td>");
                    row.append("<td>" + data.current_assignees + "</td>");
                    row.append("<td>" + data.bid + "</td>");
                    row.append("<td>" + data.priority + "</td>");
                    row.append("<td>"+
                    "<button class='btn btn-xs btn-success' type='button' onclick='update_tasks(this)'>Update</button>"
                    +"</td>");
                    table.append(row);
                    $("#table_view").append(table);
                });
            $("#table_view").show();
        }
    });// end of ajax call
}

/*
    function to get the
    update task details
*/
var asset_type_name = '';
function set_asset_type(name){
    asset_type_name = name;
}
function get_asset_type(){
    return asset_type_name;
}
var task_name = ''
function set_task_name(name){
    task_name = name;
}
function get_task_name(){
    return task_name;
}
function update_tasks(name){

    var th = get_table_header().trim().split(" ")[0];
    var project_name = get_project_name();
    var seq_name = get_sequence_name();
    var shot_name = get_shot_name();
    var asset_name = get_asset_name();
    var task_name = $(name).closest('tr').find("td:eq(0)").text().trim();
    var entity_id = $(name).closest('tr').attr('id');
    set_task_name(task_name);
    $("#collapse_task_more").hide();
    $("#id_task_name").prop("disabled",true);
    $("#id_task_name").css('display', 'none');
    $("#task_name_id").css('display', 'none');
    if (th == "Asset"){

        $("#id_task_linked_to").val(project_name + ":" + asset_name);
        $("#update_task_details").show();
        $("#submit_task_details").hide();
        var asset_type_name = get_asset_type();//$(name).closest('tr').find("td:eq(2)").text().trim();
        //get_task_types(th, asset_type_name);

        $("#id_task_name").val(task_name);
        // alert(project_name+"\n"+task_name+"\n"+asset_name);
        get_details_before_update(project_name, 'Asset_Task', task_name, '', asset_name, entity_id);
        $("#taskModal").modal("show");
    }
    else if (th == "Sequence"){

        $("#id_task_linked_to").val(project_name + ":" + seq_name)
        $("#update_task_details").show();
        $("#submit_task_details").hide();
        //get_task_types(th, '');
        get_details_before_update(project_name, 'Sequence_Task', seq_name, '', task_name, entity_id);
        $("#taskModal").modal("show");
    }
    else if (th == "Shot"){

        $("#id_task_linked_to").val(project_name + ":" + seq_name + ":" + shot_name);
        $("#update_task_details").show();
        $("#submit_task_details").hide();
        //get_task_types(th, '');
        get_details_before_update(project_name, 'Shot_Task', seq_name, shot_name, task_name, entity_id);
        $("#taskModal").modal("show");
    }

    set_entity_id($(name).closest('tr').attr('id'));
    set_entity_name($(name).closest('tr').attr('data-object'));
}

/*
    function to update tasks
    on click
*/

$("#update_task_details").click(function(){
    console.log(task_name);
    var task_name = get_task_name();//$("#id_task_name option:selected").text().trim();
    //var task_name = $("#id_task_name").val().trim();
    var description = $("#id_task_description").val();
    var assignee = $("#id_task_assignee").val();
    var bid_days = $("#id_task_bid_days").val();
    var task_status = $("#id_task_status").val();
    var task_priority = $("#id_task_priority option:selected").val().trim();
    var start_date = $("#id_task_start_date").val();
    var due_date = $("#id_task_due_date").val();
    var task_scope = $("#id_task_scope").val();
    var entity_name = $("#id_task_entity_name").val();
    var flag_status = 'update';
    var linked_to = $("#id_task_linked_to").val();
    var str = linked_to.split(":");
    var project_name = '';
    var sequence_name = '';
    var shot_name = '';
    var asset_name = '';

    var th = get_table_header().trim();

    console.log("----"+th);
    if (th == 'Sequence'){
        project_name = str[0];
        sequence_name = str[1];
        alert(sequence_name);
    }
    if (th == 'Shot'){
        project_name = str[0];
        sequence_name = str[1];
        shot_name = str[2];
       // alert(shot_name);
    }
    if (th == 'Asset'){
        project_name = str[0];
        asset_name = str[1];
        set_asset_name(asset_name);
    }
    var sdate = new Date(start_date);
    var edate = new Date(due_date);

    if (sdate > edate){
        alert("Start date must not exceed end date!!!!");
        return false;
    }
    if (start_date == '' && due_date == ''){
        alert("Date field must not be empty!!!!");
        return false;
    }
    if (task_name == 'Select Option'){
        alert("Select Valid Option!!!");
        return false;
    }
    if (assignee == 'Select Option'){
        alert("Select Assignee");
        return false;
    }
    if (bid_days == ''){
        alert("Bid Days must not be empty!!!");
        return false;
    }
    
    bid_days = 60*60*10*bid_days
    
    var data_array = {};
    data_array['task_id'] = get_entity_id();
    data_array['task_object'] = get_entity_name();
    data_array['description'] = description;
    data_array['start_date'] = start_date;
    data_array['end_date'] = due_date;
    data_array['bid'] = bid_days;
    data_array['priority'] = task_priority;
    data_array['assignee'] = assignee;
    data_array['task_status'] = task_status;

    var data_list = [];
    data_list.push(data_array);

    var entity_name = 'Task';

    update_form_data(entity_name,data_list);

    $("#taskModal").modal("hide");
    clear_task_fields();
    $("#id_task_name").removeAttr("disabled");
    $('#table_view').empty();

    window.setTimeout(function(){
        if (th == 'Sequence'){
            project_name = str[0];
            sequence_name = str[1];
            get_task_details(project_name, sequence_name, th);
        }
        if (th == 'Shot'){
            project_name = str[0];
            sequence_name = str[1];
            shot_name = str[2];
            get_task_details(project_name, sequence_name, shot_name, th);
        }
        if (th == 'Asset'){
            project_name = str[0];
            asset_name = str[1];
            set_asset_name(asset_name);
            get_task_details(project_name, asset_name, th);
        }
}, 3000);
/*
    else{
        $.ajax({
            type: "POST",
            url : "/callajax/",
            data: {
                "object_name" : "Task_Creation",
                "task_name": task_name,
                //"task_name": task_name,
                "description": description,
                "assignee": assignee,
                "bid_days": bid_days,
                "task_status": task_status,
                "task_priority": task_priority,
                "start_date": start_date,
                "due_date": due_date,
                "task_scope": task_scope,
                "entity_name": entity_name,
                "flag_status": flag_status,
                "project_name": get_project_name(),
                "sequence_name": get_sequence_name(),
                "shot_name": get_shot_name(),
                "asset_name": get_asset_name(),
                "type": th
            },
            success: function(json){
                alert("Successfully updated tasks!!!!!");
                if (th == "Sequence")
                    get_task_details(project_name, sequence_name, "Sequence");
                if (th == "Asset"){
                    console.log(type);
                    get_task_details(project_name, asset_name, "Asset");
                    }
                if (th == "Shot")
                    get_task_details(project_name, sequence_name, "Shot");
            }
        });//end of Ajax Call
        $("#taskModal").modal("hide");
        clear_task_fields();
        $("#id_task_name").removeAttr("disabled");
    }// end of else
*/
});

/*
    function to get the project
    details
*/
function get_project_details(){

    $.ajax({
        type: "POST",
        url: "/callajax/",
        data :{
        "object_name" : "display_project_thumbnail_manner"
        },
        beforeSend: function(){
	    var create_proj = '<div class="box col-md-3" style="text-align: center;font-size: 20px;height: 261px;">\
		    <br><br>\
		    <button id="create_project" type="button" class="btn btn-default btn-lg" onclick="create_project_click()" style="height: 120px;font-size: 24px;color: #b0e22b;"> \
          <span class="glyphicon glyphicon-plus"></span> <br> New Project \
        </button>\
		</div>';
          $("#table_view").html(create_proj);
        },
        success: function(json){
	    var table = $('#project_table');
                $.each(json, function(idx, data){
                    new_div = '\
                        <div class="box col-md-3" style="height: 261px;background-color: #666;">\
              <ul class="list-group">\
                <li class="list-group-item">\
                  <label>Project Name: &nbsp;</label><a id="'+data.ftrack_id+'" data-object="Project">'+data.name+'</a>\
                  <div style="text-align: center;">\
                    <button class="btn btn-xs btn-primary" type="button" onclick="display_create_modal(this)">Create</button>&nbsp;&nbsp;\
                    <button class="btn btn-xs btn-info" type="button" onclick="display_view_modal(this)">View</button>\
                  </div>\
                </li>\
                <li class="list-group-item">\
                  <label>Start Date: &nbsp;</label><strong>'+data.startdate+'</strong>\
                </li>\
                <li class="list-group-item">\
                  <label>Resolution: &nbsp;</label><strong>'+data.resolution+'</strong>\
                </li>\
                <li class="list-group-item">\
                  <label>Start Frame: &nbsp;</label><strong>'+data.startFrame+'</strong>\
                </li>\
                <li class="list-group-item">\
                  <label>FPS: &nbsp;</label><strong>'+data.fps+'</strong>\
                </li>\
              </ul>\
            </div>';
                    $("#table_view").append(new_div);
                });
                $("#table_view").show();
        }
    //<button class="btn btn-xs btn-success" type="button" onclick="display_proj_modal(this)">Update</button>\
    });// end of ajax call
}

function display_proj_modal(name){
    project_name = $(name).closest("li").find('a').text();
    var entity_id = $(name).closest("li").find('a').attr('id');
    $("#id_project_name").val(project_name);
    $("#id_project_name").prop("disabled", true);
    $("#id_project_code").prop("disabled", true);
    $("#update_details").show();
    $("#submit_details").hide()
    $('#projectModal').modal('show');
    get_details_before_update(project_name, 'project', '', '', '', entity_id);
}

/*
    display option to create asset,
    sequence & shot
*/
function display_create_modal(name){
    $("#asset_li").show();
    $("#sequence_li").show();
    $("#shot_li").hide();
    $("#view_asset_li").hide();
    $("#view_seq_li").hide();
    $("#task_li").hide();
    $("#shot_view_li").hide();
    $("#task_view_li").hide();
    $("#Update_sequence_details").hide();
    $("#submit_sequence_details").show();
    s = $(name).closest("li").find('a').text();
    set_project_name(s);
    $('#createModal').modal('toggle');
   
    id = $(name).closest("li").find('a').attr('id');
    my_object = $(name).closest("li").find('a').attr('data-object');

    set_parent_object(my_object);
    set_parent_id(id);

    $("#create_asset_csv_label").css('display', 'block');
}


function display_view_modal(name){
    s = $(name).closest("li").find('a').text();

    set_project_name(s);
    $("#view_asset_li").show();
    $("#view_seq_li").show();
    $("#asset_li").hide();
    $("#sequence_li").hide();
    $("#shot_li").hide();
    $("#task_li").hide();
    $("#task_view_li").hide();
    $("#shot_view_li").hide();
    $('#createModal').modal('toggle');
}

var parentobject = '';
function set_parent_object(p_object){
    parentobject = p_object;
}
function get_parent_object(){
    return parentobject;
}

var parentid = '';
function set_parent_id(p_id){
    parentid = p_id;
}
function get_parent_id(){
    return parentid;
}

var entityid = '';
function set_entity_id(id){
    entityid = id;
}
function get_entity_id(){
    return entityid;
}

var entityname = '';
function set_entity_name(name){
    entityname = name;
}
function get_entity_name(){
    return entityname;
}

var project_name = '';
function set_project_name(name){
    project_name = name;
}
function get_project_name(){
    return project_name;
}

var seq_name = '';
function set_sequence_name(name){
    seq_name = name
}
function get_sequence_name(){
    return seq_name
}
// on click of create_Seq show modal
$('#create_sequence').click(function(){
    clear_sequence_fields();
    $('#createModal').modal('hide');
    $("#sequenceModal").modal('show');
    $('#id_sequence_parent_object_type').val(get_project_name());
    $("#id_sequence_name").removeAttr('disabled');
});

//on click of create_shot show modal
$("#create_shot").click(function(){
    clear_shot_modal_fields();
    $("#create_shot_csv_label").css("display","block");
    $('#createModal').modal('hide');
    $("#shotModal").modal("show");
});

//on click of create_asset show modal
$("#create_asset").click(function(){
    clear_asset_modal_fields();
    $('#createModal').modal('hide');
    $("#id_linked_to").val(get_project_name());
    $("#id_linked_to").prop("disabled", true);
    $("#id_asset_type").removeAttr("disabled");
    $("#id_asset_name").removeAttr("disabled");
    $("#submit_asset_details").show();
    $("#submit_asset_details").removeAttr("disabled");
    $("#update_asset_details").hide();
    $("#assetModal").modal('toggle');
});

$("#view_asset").click(function(){
    $('#createModal').modal('hide');
    $("#table_view").empty();
    get_asset_details();

    $("#previous_div").show();
    var view_asset = $('#view_asset').text();
    set_view_option(view_asset);
});

$("#view_sequence").click(function(){

    $('#createModal').modal('hide');
    $("#table_view").empty();
    get_sequence_details();

    $("#previous_div").show();
    var view_sequence = $('#view_sequence').text();
    set_view_option(view_sequence);
});

/*
    function to get the
    sequence details
*/
function get_sequence_details(){
    $("#previous_div").show();
//    $('.sidebar-nav').hide();
    $.ajax({
        type: "POST",
        url: "/callajax/",
        data: {
        "object_name": "display_sequence_details",
        "project_name": get_project_name(),
        },
        beforeSend:function(){
            $("#table_view").empty();
            create_table_display_details(type='sequence');
        },
        success: function(json){
            var table = $('#project_table');
                $.each(json, function(idx, data){
                    var row = $('<tr id="'+data.ftrack_id+'" data-object="Sequence">');
                    row.append("<td>" + data.name + "</td>");
                    row.append("<td>" + data.description + "</td>");
                    row.append("<td>" + data.type + "</td>");
                    row.append("<td>"+
                    "<button class='btn btn-xs btn-primary' type='button' onclick='create_options(this)'>Create</button>&nbsp;&nbsp;"+
                    "<button class='btn btn-xs btn-success' type='button' onclick='update_sequences(this)'>Update</button>&nbsp;&nbsp;"
                    +"<button class='btn btn-xs btn-info' type='button' onclick='display_shots(this)'>View</button></td>");
                    table.append(row);
            });// end of each loop
            $("#table_view").append(table);
        }
    });
}

/*
    function which displays
    modal to create shots or tasks
    inside sequence
*/
function create_options(name){

    var table_header = $("#project_table thead tr").find("th:eq(0)").text().trim().split(" ")[0];
    set_table_header(table_header);
    if (table_header == "Sequence"){
        clear_task_fields();
        var seq = $(name).closest('tr').find('td:eq(0)').text(); //$("#project_table tbody tr td:first").text();
        set_sequence_name(seq);
    }
    else if (table_header == "Shot"){
        clear_task_fields();
        var shot = $(name).closest('tr').find('td:eq(0)').text(); //$("#project_table tbody tr td:first").text();
        set_shot_name(shot);

    }

    $("#asset_li").hide();
    $("#sequence_li").hide();
    $("#view_asset_li").hide();
    $("#view_seq_li").hide();
    $("#shot_view_li").hide();
    $("#task_view_li").hide();
    $("#shot_li").show();
    $("#task_li").show();
    $("#id_task_name").removeAttr("disabled");
    $("#id_task_name").css('display', 'block');
    $("#task_name_id").css('display', 'block');
    $("#createModal").modal('show');

    
    id = $(name).closest("tr").attr('id');
    my_object = $(name).closest("tr").attr('data-object');

    set_parent_object(my_object);
    set_parent_id(id);
}
// on click of create shot button
$("#create_shot").click(function(){
    $("#id_name").prop("disabled",false);
    var prj_name = get_project_name();
    var seq_name = get_sequence_name();
    $('#id_parent_object_type').val(prj_name + ":" + seq_name).prop('disabled', true);
    $("#shotModal").modal('show');
    $("#createModal").modal('hide');
    $("#submit_shot_details").show();
    $("#update_shot_details").hide();
});

/*
    function to set and get
    table headers
*/
var header_name = '';
function set_table_header(name){
    header_name = name
}
function get_table_header(){
    return header_name;
}

/*
    function to set and get asset name
*/
var asset_name = '';
function set_asset_name(name){
    asset_name = name;
}
function get_asset_name(){
    return asset_name;
}

// on click of create task button
$("#create_task").click(function(){
    clear_task_fields();
    $("#createModal").modal('hide');
    var header_name = $("#project_table thead tr").find('th:eq(0)').text().trim();
    header_name = header_name.split(" ")[0].trim();
    set_table_header(header_name);
    get_task_types(get_table_header(), '');
    get_multiple_assignees();

    var prj_name = get_project_name();
    var seq_name = get_sequence_name();

    if(header_name == "Sequence")
        $("#id_task_linked_to").val(prj_name + ":" + seq_name);

    $("#id_task_name").removeAttr("disabled");
    $("#submit_task_details").show();
    $("#taskModal").modal("show");
    $("#update_task_details").hide();
});


//function to get task type
function get_task_types(type_name, asset_type_name){

    $.ajax({
        type:"POST",
        url:"/callajax/",
            data:{'object_name': 'Task_types',
                'type_name': type_name,
                'asset_type_name': asset_type_name
        },
        beforeSend: function(){
            $("#id_task_name").empty();
        },
        success: function(json){
            $("#id_task_name").append("<option value=''>Select Option</option>");
            if (type_name == "Asset"){
                if (asset_type_name){
                    $.each(json, function(idx, data){
                        $("#id_task_name").append("<option value="+data+">"+data+"</option>");
                    });
                }
                else{
                    $.each(json, function(idx, data){
                        var option_group = $("<optgroup label="+idx+" id="+idx+">");
                        $.each(data, function(k,v){
                            option_group.append("<option value="+v+">"+v+"</option>");
                        });
                        $("#id_task_name").append(option_group)
                    });
                }

            }
            else{
                $.each(json, function(idx, data){
                    $("#id_task_name").append("<option value="+data+">"+data+"</option>");
                });
            }
        }
    });
}

/*
    ajax call to get
    multiple assignee users
*/
function get_multiple_assignees(assignee){

    assignee = assignee || '';
    $.ajax({
        type:"POST",
        url:"/callajax/",
            data:{
                'object_name': 'Multiple_assignees'
        },
        beforeSend: function(){
            $("#id_task_assignee").empty();
        },
        success: function(json){
            $("#id_task_assignee").append("<option values=''> Select Option </option>");
            $.each(json, function(idx, data){
                $("#id_task_assignee").append("<option values="+data+">"+data+"</option>");
            });
	if (assignee){
	    $("#id_task_assignee").val(assignee);
	}
        }
    });
}

/*
    show sequence modal
    on update click
*/
function update_sequences(name){
    $("#id_sequence_parent_object_type").val(get_project_name());
    var seq_name = $(name).closest('tr').find('td:eq(0)').text();//$("#project_table tbody tr td:first").text();
    var entity_id = $(name).closest('tr').attr('id');
    $("#id_sequence_name").val(seq_name);
    $("#id_sequence_name").prop("disabled", true);
    $("#Update_sequence_details").show();
    $("#submit_sequence_details").hide();
    get_details_before_update(get_project_name(), 'sequence', seq_name, '', '', entity_id);
    $("#sequenceModal").modal('show');

   set_entity_id($(name).closest('tr').attr('id'));
   set_entity_name($(name).closest('tr').attr('data-object'));
}

//update sequence
$("#Update_sequence_details").click(function(){

    var sequence_name = $('#id_sequence_name').val();
    var description = $('#id_sequence_description').val();
    var status = $('#id_sequence_status option:selected').text().trim();
    var priority = $('#id_sequence_priority').val();
    var prj_name = get_project_name();
    var flag_status = 'update';

    var pattern = /^[0-9a-zA-Z]+$/;
    if(!pattern.test(sequence_name)){
        error_message("Sequence must contain alphabets or numbers");
        return false;
    }
    if(sequence_name == ''){
        error_message("Sequence Name cannot be empty!!!!");
        return false;
    }
    if (status == 'Select Status'){
        error_message("Please select proper status!!!");
        return false;
    }
        
    var data_array = {};
    data_array['parent_id'] = get_parent_id();
    data_array['parent_object'] = get_parent_object();
    data_array['seq_id'] = get_entity_id();
    data_array['seq_object'] = get_entity_name();
    
    data_array['description'] = description;

    var data_list = [];
    data_list.push(data_array);

    var entity_name = 'Sequence';

    update_form_data(entity_name,data_list);
    $('#table_view').empty();
    $("#sequenceModal").modal('hide');
    window.setTimeout(function(){
        get_sequence_details();
    }, 3000);
});
/*
    function views shots in tabular format
*/
function display_shots(name){
    var s = $(name).closest('tr').find('td:eq(0)').text();
    set_sequence_name(s);

    var th = $("#project_table thead tr").find("th:eq(0)").text().split(" ")[0];
    set_table_header(th);

    $("#asset_li").hide();
    $("#sequence_li").hide();
    $("#view_asset_li").hide();
    $("#view_seq_li").hide();
    $("#shot_view_li").hide();
    $("#shot_li").hide();
    $("#task_li").hide();
    $("#task_view_li").show();
    $("#shot_view_li").show();
    $("#createModal").modal("show");
}
/*
    function which triggers when
    the view shot button is clicked
*/
$("#view_shot").click(function(){
    $("#createModal").modal("hide");
    get_shot_details();
});

/*
    function which triggers when
    the view task button is clicked
*/
$("#view_task").click(function(){
    $("#createModal").modal("hide");
    var type = get_table_header().trim();
    if (type == "Sequence"){
        get_task_details(get_project_name(), get_sequence_name(), type);
        }
    else if (type == "Shot"){
        get_task_details(get_project_name(), get_sequence_name(), type);
        }
    else if (task == 'Asset'){
        var asset_name = $("#project_table tbody").closest('tr').find("td:eq(0)").text();
        get_task_details(get_project_name(), asset_name, type)
    }
});

/*
    function to get the
    shot details and display
*/
function get_shot_details(){
    $("#previous_div").show();

    $.ajax({
        type: "POST",
        url: "/callajax/",
        data:{
        "object_name": "display_shot_details",
        'seq_name': get_sequence_name(),
        'prj_name': get_project_name()
        },
        beforeSend:function(){
            $("#table_view").empty();
            create_table_display_details(type='shot');
        },
        success: function(json){
                var table = $('#project_table');
                $.each(json, function(idx, data){
                    var row = $('<tr id="'+data.ftrack_id+'" data-object="Shot">');
                    row.append("<td>" + data.name + "</td>");
                    row.append("<td>" + data.startframe + "</td>");
                    row.append("<td>" + data.endframe + "</td>");
                    row.append("<td>" + data.total_frames + "</td>");
                    row.append("<td>" + data.fps + "</td>");
                    row.append("<td>"+
                    "<button class='btn btn-xs btn-primary' type='button' onclick='create_tasks(this)'>Create Task</button>&nbsp;&nbsp;"+
                    "<button class='btn btn-xs btn-success' type='button' onclick='update_shots(this)'>Update</button>&nbsp;&nbsp;"+
                    "<button class='btn btn-xs btn-info' type='button' onclick='view_tasks(this)'>View Task</button>"+
                    "</td>");
                    table.append(row);
            });
            $("#table_view").append(table);
        }
    });
}

/*
    function to view tasks
    from shot in tabular format
*/
function view_tasks(name){

    var type = $("#project_table thead tr").find("th:eq(0)").text().trim().split(" ")[0];

    set_table_header(type);

    if (type == "Shot"){

        var name = $(name).closest("tr").find("td:eq(0)").text().trim();

        set_shot_name(name);
        set_entity_name("Shot");
        get_task_details(get_project_name(), get_sequence_name(), "Shot");
    }
    else if (type == "Asset"){

        var name = $(name).closest("tr").find("td:eq(0)").text().trim();

        set_asset_name(name);

        var asset_type_name = $(name).closest("tr").find("td:eq(2)").text().trim()

        set_asset_type(asset_type_name);
        set_entity_name("Asset");
        get_task_details(get_project_name(), name, "Asset");
    }
}
/*
    function to create tasks
    inside shot
*/
//function to get shot name
var shot_name = '';
function set_shot_name(name){
    shot_name = name;
}
function get_shot_name(){
    return shot_name
}
function create_tasks(name){

    clear_task_fields();
    var th = $("#project_table thead tr").find("th:eq(0)").text().split(" ")[0].trim();
    var asset_type_name = $(name).closest("tr").find("td:eq(2)").text().trim();
    set_table_header(th);
    $("#id_task_name").css('display', 'block');
    $("#task_name_id").css('display', 'block');
    $("#id_task_name").removeAttr("disabled");
    get_multiple_assignees();
    if (th == 'Shot'){
        get_task_types(get_table_header(), '');
        var shot_name = $(name).closest("tr").find("td:eq(0)").text().trim();
        $("#id_task_linked_to").val(get_project_name() + ":" + get_sequence_name() + ":" + shot_name);
        set_shot_name(shot_name);
    }
    else if (th == "Asset"){
        get_task_types(get_table_header(), asset_type_name);
        var asset_name = $(name).closest("tr").find("td:eq(0)").text().trim();
        $("#id_task_linked_to").val(get_project_name() + ":" + asset_name);
    }
    $("#submit_task_details").show();
    $("#update_task_details").hide();
    $("#taskModal").modal("show");

    id = $(name).closest("tr").attr('id');
    my_object = $(name).closest("tr").attr('data-object');

    set_parent_object(my_object);
    set_parent_id(id);

}
/*
    function to update shot
    details
*/
function update_shots(name){
    var prj_name = get_project_name();
    var seq_name = get_sequence_name();
    $('#id_parent_object_type').val(prj_name+":"+seq_name).prop('disabled',true);
    var shot_name = $(name).closest('tr').find('td:eq(0)').text();
    var entity_id = $(name).closest('tr').attr('id');

    $("#id_name").val(shot_name);
    $("#id_name").prop('disabled', true);
    $("#id_shot_type").prop("disabled", true);
    $("#id_total_frames").prop("disabled", true);
    $("#id_frame_duration").prop("disabled", true);
    $("#id_key_frames").prop("disabled", true);
    get_details_before_update(prj_name, 'shot', seq_name, shot_name, '', entity_id);
    $("#shotModal").modal("show");
    $("#submit_shot_details").hide();
    $("#update_shot_details").show();

   set_entity_id(entity_id);
   set_entity_name($(name).closest('tr').attr('data-object'));

   $("#create_shot_csv_label").css("display", "none");
}

// to update shot
$("#update_shot_details").click(function(){

    var shot_type = $('#id_shot_type').val();
    var name = $('#id_name').val().trim();
    var description = $('#id_description').val();
    var status = $('#id_status').val();
    var priority = $('#id_priority').val();
    var entity_name = $('#id_entity_name').val();
    var frame_start = $('#id_frame_start').val();
    var frame_end = $('#id_frame_end').val();
    var key_frames = $('#id_key_frames').val();
    var sequence_name = get_sequence_name();
    //var shot_name = get_shot_name();
    var flag_status = 'update';
    //var old_shot_name = get_shot_name();

    var pattern_name = /^[0-9a-zA-Z]+$/;
    if (!pattern_name.test(name)){
        error_message("Shot name must be alphanumeric!!!!!");
        return false;
    }
    if (status == 'Select Status'){
        error_message("Select proper status!!!!!");
        return false;
    }
    if(frame_end <= frame_start){
        error_message("End frame must be higher than start frame!!!!");
        return false;
    }
    var data_array = {};
    data_array['parent_id'] = get_parent_id();
    data_array['parent_object'] = get_parent_object();
    data_array['shot_id'] = get_entity_id();
    data_array['shot_object'] = get_entity_name();
    
    data_array['description'] = description;
    data_array['start_frame'] = frame_start;
    data_array['end_frame'] = frame_end;

    var data_list = [];
    data_list.push(data_array);

    var entity_name = 'Shot';

    update_form_data(entity_name,data_list);
    $('#table_view').empty();
    $("#shotModal").modal("hide");
    clear_shot_modal_fields();

    window.setTimeout(function(){
        get_shot_details();
    }, 3000);
});


/*
    show the breadcrumb to
    traverse back to previous
    div
*/

var set_view_var = '';
function set_view_option(name){
    set_view_var = name;
}
function get_view_option(){
    return set_view_var;
}


$("#previous_page").click(function(){
    var prev_name = 'null';
    var th_name = $("#table_view #project_table").find('th:eq(0)').text();
    var nm = th_name.split(" ")[0].trim();

    if($("#table_view #project_table tbody td").length > 0){//.contains('td')){
        prev_name = $("#table_view #project_table").find('td:eq(2)').text();
	prev = $("#table_view #project_table").find('tbody tr').attr('data-object');
        if(prev_name == 'Sequence'){
            $("#table_view").empty()
            get_project_details();
            $("#previous_div").hide();
        }
        else if(prev_name == 'Asset'){
            $("#table_view").empty();
            get_project_details();
            $("#previous_div").hide();
        }
        else if(prev_name == 'Static shot' || prev_name == 'Dynamic' || prev_name == ""){
            $("#table_view").empty();
            get_sequence_details();
        }
	else if(prev == 'Shot'){
	    $("#table_view").empty();
	    get_sequence_details();
	}
        else if(prev_name == 'Set' || prev_name == 'Vehicle' || prev_name == 'Prop' || prev_name == 'Character'){
            $("#table_view").empty();
            get_project_details();
            $("#previous_div").hide();
        }
        else if(nm == 'Task'){
            $("#table_view").empty();
            if (get_table_header().trim() == "Sequence")
                get_sequence_details();
            else if (get_table_header().trim() == "Shot")
                get_shot_details();
            else if (get_table_header().trim() == "Asset")
                get_asset_details();

            $("#previous_div").show();
        }
    }
    else{

        if(prev_name == 'null'){
            if(nm == 'Asset'){
                $("#table_view").empty();
                get_project_details();
                $("#previous_div").hide();
            }
            else if(nm == 'Sequence'){

                $("#table_view").empty()
                get_project_details();
                $("#previous_div").hide();
            }
            else if(nm == 'Shot'){
                $("#table_view").empty();
                get_sequence_details();
            }else if(nm == 'Task'){
                $("#table_view").empty();

                if (get_table_header().trim() == "Sequence")
                    get_sequence_details();

                else if (get_table_header().trim() == "Shot")
                    get_shot_details();

                else if (get_table_header().trim() == "Asset")
                    get_asset_details();
            }
        }
    }
});
/**
    display data in
    tabular format
*/
function create_table_display_details(data){

    var table = $('<table class="table-hover table-condensed table-bordered" id="project_table"/>');
    thead = $('<thead/>');
    tbody = $('<tbody />');
    var headerCell = '';
    var header = '';
    var row = $(thead[0].insertRow(-1));

    if( data == 'sequence'){
        var headerCell = $('<th style="width: 400px;" class="head_class" name="Sequence Name" title="Double Click to sort" onclick="sortOrder(this)"/>');
        var header = "Sequence Name";

        headerCell.html('<i class="glyphicon glyphicon-sort-by-alphabet"></i>&nbsp;'+header);
        row.append(headerCell);

        headerCell = $('<th style="width: 400px;" class="head_class" name="Description" />');
        header = 'Description';
        headerCell.html(header);
        row.append(headerCell);

        headerCell = $('<th style="width: 400px;" class="head_class" name="Type" />');
        header = 'Type';
        headerCell.html(header);
        row.append(headerCell);

        headerCell = $('<th style="width: 400px;" class="head_class" name="Action" />');
        header = 'Action';
        headerCell.html(header);
        row.append(headerCell);

        table.append(thead);
        table.append(tbody);
    }
    else if( data == 'shot'){
        var headerCell = $('<th style="width: 400px;" class="head_class" name="Shot Name" title="Double Click to sort" onclick="sortOrder(this)"/>');
        var header = "Shot Name";

        headerCell.html('<i class="glyphicon glyphicon-sort-by-alphabet"></i>&nbsp;'+header);
        row.append(headerCell);

        headerCell = $('<th style="width: 400px;" class="head_class" name="Frame Start" />');
        header = 'Frame Start';
        headerCell.html(header);
        row.append(headerCell);

        headerCell = $('<th style="width: 400px;" class="head_class" name="Frame End" />');
        header = 'Frame End';
        headerCell.html(header);
        row.append(headerCell);

        headerCell = $('<th style="width: 400px;" class="head_class" name="Total Frames" />');
        header = 'Total Frames';
        headerCell.html(header);
        row.append(headerCell);

        headerCell = $('<th style="width: 400px;" class="head_class" name="Frame Duration" />');
        header = 'Frame Duration';
        headerCell.html(header);
        row.append(headerCell);

        headerCell = $('<th style="width: 400px;" class="head_class" name="Action" />');
        header = 'Action';
        headerCell.html(header);
        row.append(headerCell);

        table.append(thead);
        table.append(tbody);
    }
    else if( data == 'asset'){
        var headerCell = $('<th style="width: 400px;" class="head_class" name="Asset Name" title="Double Click to sort" onclick="sortOrder(this)"/>');
        var header = "Asset Name";

        headerCell.html('<i class="glyphicon glyphicon-sort-by-alphabet"></i>&nbsp;'+header);
        row.append(headerCell);

        headerCell = $('<th style="width: 400px;" class="head_class" name="Description" />');
        header = 'Description';
        headerCell.html(header);
        row.append(headerCell);

        headerCell = $('<th style="width: 400px;" class="head_class" name="Type" />');
        header = 'Type';
        headerCell.html(header);
        row.append(headerCell);

        headerCell = $('<th style="width: 400px;" class="head_class" name="Action" />');
        header = 'Action';
        headerCell.html(header);
        row.append(headerCell);

        table.append(thead);
        table.append(tbody);
    }
    else if( data == 'task'){
        var headerCell = $('<th style="width: 400px;" class="head_class" name="Task Name" title="Double Click to sort" onclick="sortOrder(this)"/>');
        var header = "Task Name";

        headerCell.html('<i class="glyphicon glyphicon-sort-by-alphabet"></i>&nbsp;'+header);
        row.append(headerCell);

        headerCell = $('<th style="width: 400px;" class="head_class" name="Start Date" />');
        header = 'Start Date';
        headerCell.html(header);
        row.append(headerCell);

        headerCell = $('<th style="width: 400px;" class="head_class" name="End Date" />');
        header = 'End Date';
        headerCell.html(header);
        row.append(headerCell);

        headerCell = $('<th style="width: 400px;" class="head_class" name="Ftrack Status" />');
        header = 'Ftrack Status';
        headerCell.html(header);
        row.append(headerCell);

        headerCell = $('<th style="width: 400px;" class="head_class" name="Assignee" />');
        header = 'Assignee';
        headerCell.html(header);
        row.append(headerCell);

        headerCell = $('<th style="width: 400px;" class="head_class" name="Bid" />');
        header = 'Bid';
        headerCell.html(header);
        row.append(headerCell);

        headerCell = $('<th style="width: 400px;" class="head_class" name="Complexity" />');
        header = 'Complexity';
        headerCell.html(header);
        row.append(headerCell);

        headerCell = $('<th style="width: 400px;" class="head_class" name="Action" />');
        header = 'Action';
        headerCell.html(header);
        row.append(headerCell);

        table.append(thead);
        table.append(tbody);
    }
    $("#table_view").append(table);
}

function get_details_before_update(project_name, flag, seq_name, shot_name, asset_name, entity_id){
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data:{
        'object_name': 'get_details',
        'project_name': project_name,
        'sequence_name': seq_name,
        'shot_name': shot_name,
        'asset_name': asset_name,
        'entity_id': entity_id,
        'flag': flag
        },
        success:function(json){
            if(flag == 'project'){
                $.each(json, function(idx, data){
                    $('#project_id #id_project_code').val(data.project);
                    $('#project_id #id_project_code').attr('data-id',data.ftrack_id);
                    $('#project_id #id_start_date').val(data.startdate);
                    $('#project_id #id_end_date').val(data.enddate);
                    $('#project_id #id_status').val(data.status);
                    $('#project_id #id_fps').val(data.fps);
                    $('#project_id #id_resolution').val(data.resolution);
                    $('#project_id #id_start_frame').val(data.startframe);
                });
            }
            if(flag == 'sequence'){
                $.each(json, function(idx, data){
                    $('#id_sequence_description').val(data.description);
                    $('#id_sequence_entity_name').val(data.entity_name);
                    $('#id_sequence_priority').val(data.priority);
                });
            }
            if(flag == 'shot'){
                $.each(json, function(idx, data){
                    $('#id_description').val(data.description);
                    $('#id_sequence_entity_name').val(data.entity_name);
                    $('#id_sequence_priority').val(data.priority);
                    $('#id_frame_start').val(data.startframe);
                    $('#id_frame_end').val(data.endframe);
                    calculate_fps(data.startframe, data.endframe, project_name, seq_name);
                });
            }
            if(flag == 'asset'){
                $.each(json, function(idx, data){
                    $('#id_asset_type').val(data.type);
                    $('#id_asset_name').val(data.name);
                    $('#id_asset_description').val(data.description);
                    $('#id_asset_priority').val(data.priority);
                    $('#id_asset_entity_name').val(data.entity_name);
                    $('#id_asset_status').val(data.ftrack_status);
                });
            }
            if (flag == 'Asset_Task'){
                set_values_asset_sequence_shot_task(json);
            }
            if (flag == 'Sequence_Task'){
                set_values_asset_sequence_shot_task(json);
            }
            if (flag == 'Shot_Task'){
                set_values_asset_sequence_shot_task(json);
            }
        }
    });
}

function set_values_asset_sequence_shot_task(json){
    $.each(json, function(idx, data){
        $("#id_task_name").val(data.type);
        $("#id_task_description").val(data.description);
        get_multiple_assignees(data.current_assignees);
        $("#id_task_bid_days").val(data.bid);
        $("#id_task_priority").val(data.priority);
	    set_ftrack_status(data.ftrack_status);
        $("#id_task_start_date").val(data.startdate);
        $("#id_task_due_date").val(data.enddate);
    });
}

function set_ftrack_status(ftrack_status){

    $("#id_task_status > option").each(function(){
    if (ftrack_status == this.text){
        $('select[name="task_status"]').val(this.text);
        //$('select[name="task_status"]').find('option[value='+'"'+this.text+'"'+']').attr("selected", true);
        return false;
    }
    });
}

/*
    checkbox to load asset through csv
*/
$("#asset_csv").click(function(){
    if ($(this).prop("checked"))
        $("#asset_creation .container").css('display', 'none');
    else
        $("#asset_creation .container").css('display', 'block');
});

/*
    on click of asset csv button
*/
$("#submit_asset_details_csv").click(function(){

    /*var form = $("#asset_creation")[0];
    alert(form);

    var form_data = new FormData(form);
    alert(form_data);

    form_data.append('file',$("#asset_creation").get(0).files);
    console.log(form_data);*/

    //var form_data = new FormData($('asset_form').get(0));

    /*jQuery.each($('input[name^="asset_file"]').files, function(i, file){
        form_data.append(i, file);
    });*/

    //console.log(form_data);

    var filename = $("#id_asset_file").val();
  //  alert(filename);

    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: //form_data,
        {
        'object_name': 'asset_csv_upload',
        'project_name': get_project_name(),
        'filename': filename
        },
        /*processData: false,
        contentType: false,
        cache: false,*/
        success:function(json){
            alert("success");
        }
    });
});

// for video popup

function light_video_box_open(param) {
  var id = $(param).prev().attr('id')
  window.scrollTo(0, 0);
  document.getElementById(id).style.display = 'block';
}

function light_video_box_close(param) {
  var cls_div = $(param).closest('div');
  var id = $(cls_div).attr('id');
  document.getElementById(id).style.display = 'none';
}
// for image popup

function light_image_box_open(param) {
    var cls_img = param.closest('img');
    var id = cls_img.src
    window.scrollTo(0, 0);
    document.getElementById(id).style.display = 'block';
}

function light_image_box_close(param) {
    var cls_div = param.closest('div');
    var id = cls_div.id
    document.getElementById(id).style.display = 'none';
}


// Reload page here
window.onload = function() {
    if ($('#dashboard_page').attr('class') == 'active'){
        user_dashboard();
    }
    if ($('#mgm_dashboard_page').attr('class') == 'active'){
        mgm_dashboard();
    }
    if ($('#artist_tasks').attr('class') == 'active'){
        show_artist_tasks();
    }
    if ($('#review_tasks').attr('class') == 'active'){
        show_review_tasks();
    }
    if($('#create_project_page').attr('class') == 'active'){
        get_project_details();
    }
    if($('#artist_productivity_reports').attr('class') == 'active'){
        artist_productivity();
    }
    if($('#month_wise_reports').attr('class') == 'active'){
        month_wise_reports();
    }
}

