$("#selectObject").change(function(){

    var obj_name = $("#selectObject").val();
    var type_select = $("#selectType").val();
    prev_div = '#div_'+type_select+'_checkbox';
    $(prev_div).css({'display':'none'});

    reset_object()

    var proj_id = $('#selectProject').val();
    if (!proj_id){
        error_message("Please select valid project !!")
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
	create_summary_div(div_check);
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

// FTP Upload Start here ---->

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
    }else if ($('#selectFtpStatus').val() == 'Outsource'){
        $('#upload_tips').html('<span style="font-weight:bold; font-size:21px;text-decoration:underline">Status Convention to be followed-</span></br>Task status , Version Status : Outsource Approved');
    }else if ($('#selectFtpStatus').val() == 'DI'){
        $('#upload_tips').html('<span style="font-weight:bold; font-size:21px;text-decoration:underline">Status Convention to be followed-</span></br>Task status , Version Status : Review Approved');
    }else {
        $('#upload_tips').html('<span style="font-weight:bold; font-size:21px;text-decoration:underline">Status Convention to be followed-</span></br>Task status , Version Status : Internal Approved');
    }
}

$("#selectFtpObject").change(function(){

    var project = $('#selectProject').val();
    if (!project){
        error_message("Please select valid project !!")
        return null
    }

    reset_ftp_object();

    var obj_name = $("#selectFtpObject").val();
    if (obj_name == 'Shot'){
	$("#div_shot_department_name").css({'display':'block'});
	$("#div_asset_department_name").css({'display':'none'});
	$("#selectShotFtpDepartment_chosen").css({"width":"89%"});
	$('#selectShotFtpDepartment').val('').trigger("liszt:updated").trigger("chosen:updated");
	load_obj_name('FtpSequence','');
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

function reset_ftp_object(){

    $('#all_assets').attr('checked',false);
    $('#all_shots').attr('checked',false);

    $("#selectFtpSequence").empty();
    $("#selectFtpSequence").trigger("chosen:updated");
    $("#selectFtpSequence").trigger("liszt:updated");
    $("#div_sequence_name").css({'display':'none'});

    $("#selectFtpShot").empty();
    $("#selectFtpShot").trigger("chosen:updated");
    $("#selectFtpShot").trigger("liszt:updated");
    $("#div_shot_name").css({'display':'none'});

    $("#selectFtpType").empty();
    $("#selectFtpType").trigger("chosen:updated");
    $("#selectFtpType").trigger("liszt:updated");
    $("#div_type_name").css({'display':'none'});

    $("#selectFtpAsset").empty();
    $("#selectFtpAsset").trigger("chosen:updated");
    $("#selectFtpAsset").trigger("liszt:updated");
    $("#div_asset_build_name").css({'display':'none'});

    remove_rows('#tbl_task');
}

$('#selectFtpSequence').on('change', function(evt, params) {

    var task_name = $("#selectShotFtpDepartment").val();
    if (!task_name){
        error_message("Please select valid Department !!")
        return null
    }

    var deselectedValue = params.deselected;
    var selectedValue = params.selected;

    if (selectedValue){
        refresh_shots();
    }else if (deselectedValue){
        de_seq = $("#selectFtpSequence option[value='"+deselectedValue+"']").text();
        $("#selectFtpShot option:contains('"+de_seq+"')").remove();
        $("#selectFtpShot").trigger("chosen:updated");
        $("#selectFtpShot").trigger("liszt:updated");
        $("#tbl_ftp_version tr:contains("+ de_seq +")").remove();
    }
});

$('#selectShotFtpDepartment').change(function(){
    task_name = $(this).val();
    if (task_name == 'Lighting'){
	$('#div_side_name').css({'display':'block'});
	$("#selectFtpVersionSide_chosen").css({"width":"89%"})
    }else{
	$('#div_side_name').css({'display':'none'});
    }

    $('#selectFtpVersionSide').val('').trigger("liszt:updated").trigger("chosen:updated");
    refresh_shots();
    load_ftp_asset_type();
});

$('#refresh_shot').click(function(){
    refresh_shots();
});

function refresh_shots(){

    selected_seqs = $('#selectFtpSequence').val();

    if (selected_seqs){
	load_ftp_shots(selected_seqs);
    }
}

function load_ftp_shots(selected_seqs) {

    obj_name = 'Ftp Shot';
    var project = $('#selectProject').val();
    if (!project){
        error_message("Please select valid project !!")
        return null
    }

    var dept = $('#selectShotFtpDepartment').val();
    if (!dept){
        error_message("Please select valid department !!")
        return null
    }

    var upload_for = $('#selectFtpStatus').val();
    if (!upload_for){
        error_message("Please select valid upload_for !!")
        return null
    }

    data_array = JSON.stringify(selected_seqs);

    $select_elem = $("#selectFtpShot");
    $div_name = $("#div_shot_name");

    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'project': project ,'object_name': obj_name , 'parent_ids' : data_array, 'task_name': dept, 'upload_for': upload_for},
        beforeSend: function(){
	    $select_elem.empty();
            $div_name.css({'display':'block'});
        },
        success: function(json){
            $.each(json, function (idx, obj) {
		opt_id = obj.id;
		opt_text = obj.name;
		opt_task_id = obj.task_id;
		$select_elem.append('<option value="'+opt_id+'" data-task-id="'+opt_task_id+'">' + opt_text + '</option>');
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

$('#selectAssetFtpDepartment').change(function(){
    task_name = $(this).val();
    if (task_name == 'Lighting'){
	$('#div_side_name').css({'display':'block'});
	$("#selectFtpVersionSide_chosen").css({"width":"89%"})
    }else{
	$('#div_side_name').css({'display':'none'});
    }

    $('#selectFtpVersionSide').val('').trigger("liszt:updated").trigger("chosen:updated");
    refresh_asset_builds();
    load_ftp_asset_type();
});

$('#refresh_asset_build').click(function(){
    refresh_asset_builds();
});

$("#selectFtpType").change(function(){
    select_type = $("#selectFtpType").val();
    if (!select_type){
        error_message("Please select valid asset type !!!");
        return null;
    }
    refresh_asset_builds();
});

function refresh_asset_builds(){

    selected_type = $('#selectFtpType').val();

    if (selected_type){
	load_ftp_asset_builds(selected_type);
    }
}

function load_ftp_asset_builds(selected_type) {

    obj_name = 'Ftp Asset Build';
    var project = $('#selectProject').val();
    if (!project){
        error_message("Please select valid project !!")
        return null
    }

    var dept = $('#selectAssetFtpDepartment').val();
    if (!dept){
        error_message("Please select valid department !!")
        return null
    }

    var upload_for = $('#selectFtpStatus').val();
    if (!upload_for){
        error_message("Please select valid upload_for !!")
        return null
    }

    $select_elem = $("#selectFtpAsset");
    $div_name = $("#div_asset_build_name");

    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'project': project ,'object_name': obj_name , 'asset_build_type' : selected_type, 'task_name': dept, 'upload_for': upload_for},
        beforeSend: function(){
	    $select_elem.empty();
            $div_name.css({'display':'block'});
        },
        success: function(json){
            $.each(json, function (idx, obj) {
		opt_id = obj.id;
		opt_text = obj.name;
		opt_task_id = obj.task_id;
		$select_elem.append('<option value="'+opt_id+'" data-task-id="'+opt_task_id+'">' + opt_text + '</option>');
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

$('#selectFtpAssetType').change(function(){
    obj = $('#selectFtpObject').val();
    var select = '';
    if (obj == 'Shot'){
	select = 'selectFtpShot';
    }else if (obj == 'Asset Build'){
	select = 'selectFtpAsset';
    }

    $('#selectFtpAssetName').val('').trigger("liszt:updated").trigger("chosen:updated");

    values = $('#'+select).val();
    if (!values){
	$('#selectFtpAssetType').val('').trigger("liszt:updated").trigger("chosen:updated");
	error_message("Please select "+obj);
	return null;
    }

    load_ftp_components();

    task_ids = [];
    for (i in values){
	parent_id = values[i];
	task_id = $("#"+select+" option[value='"+parent_id+"']").attr('data-task-id');
	task_ids.push(task_id);
    }

    load_ftp_asset_name(task_ids);

});

function load_ftp_asset_type(){

    parent_object = $('#selectFtpObject').val();

    task_name = ''
    if(parent_object=='Shot'){
	task_name = $('#selectShotFtpDepartment').val();
    }else{
	task_name = $('#selectAssetFtpDepartment').val();
    }

    var $select_elem = $('#selectFtpAssetType');
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'parent_object' : parent_object, 'task_name': task_name, 'object_name': 'Ftp Asset Type'},
        beforeSend: function(){
	    $select_elem.empty();
	    $select_elem.append('<option value="">-- Select --</option>');
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

function load_ftp_asset_name(task_ids) {

    asset_type = $('#selectFtpAssetType').val();
    if(!asset_type){
	error_message("Please select valid asset type !!!");
	return null;
    }

    project = $('#selectProject').val();

    task_ids = JSON.stringify(task_ids);
    var $select_elem = $('#selectFtpAssetName');

    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'object_name': 'Ftp Asset Name', 'asset_type': asset_type, 'task_ids': task_ids, 'project': project},
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
function load_ftp_components() {

    asset_type = $('#selectFtpAssetType').val();
    if(!asset_type){
	error_message("Please select valid asset type !!!");
	return null;
    }

    parent_object = $('#selectFtpObject').val();

    task_name = ''
    if(parent_object=='Shot'){
	task_name = $('#selectShotFtpDepartment').val();
    }else{
	task_name = $('#selectAssetFtpDepartment').val();
    }

    var $select_elem = $('#selectFtpExt');
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'parent_object' : parent_object, 'task_name': task_name, 'object_name': 'Ftp Component', 'asset_type': asset_type},
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
        error_message("Please select valid Object !!")
        return null
    }

    var select_type = $("#selectType").val();

    div_check = '#div_'+select_type+'_checkbox';
    prev_div = '#div_'+previous+'_checkbox';
    $(prev_div).css({'display':'none'});
    $(div_check).css({'display':'block'});
    create_table(div_check);
    create_summary_div(div_check);

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

// Asset Build
$("#selectAsset").on('change', function(evt, params) {

    var proj_id = $('#selectProject').val();
    if (!proj_id){
        error_message("Please select valid project !!");
        return null;
    }
    var deselectedValue = params.deselected;
    var selectedValue = params.selected;
    var project_name = $('#selectProject option:selected').text().trim();

    object = $('#selectObject').val();

    if (selectedValue){
        var array = [];
        array[0] = selectedValue
	id = selectedValue
        p_name = $("#selectAsset option[value='"+id+"']").text();
        load_tasks(array, '', p_name, 0, object, '', project_name);
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

    var deselectedValue = params.deselected;
    var selectedValue = params.selected;

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
});

// sequence box
$('#selectSequence').on('change', function(evt, params) {

    $('#all_shots').attr('checked',false);
    var obj_name = $("#selectObject").val();
    if (!obj_name){
        error_message("Please select valid Object !!")
        return null
    }
    var deselectedValue = params.deselected;
    var selectedValue = params.selected;
    var project_name = $('#selectProject option:selected').text().trim();

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
        load_tasks(array, '', p_name, 0, obj_name, '', project_name);
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
    var project_name = $('#selectProject option:selected').text().trim();

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
		parent_object_name = 'Shot Asset Build';
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
    load_tasks(parent_ids, pparent_ids,parent_name,reload,parent_object_name,parent_object_type, project_name);

}


// Shot
$('#selectShot').on('change', function(evt, params) {
    var proj_id = $('#selectProject').val();
    if (!proj_id){
        error_message("Please select valid project !!");
        return null;
    }
    var project_name = $("#selectProject option:selected").text().trim();

    var deselectedValue = params.deselected;
    var selectedValue = params.selected;

    object = $('#selectObject').val();

    if (selectedValue){
        var array = [];
        array[0] = selectedValue
	id = selectedValue
        p_name = $("#selectShot option[value='"+id+"']").text();

        load_tasks(array, '', p_name, 0, object, '', project_name);
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

function load_tasks(parent_ids, pparent_ids,parent_name,reload,
                    parent_object_name,parent_object_type, project_name
                    ) {

    var task;
    parent_name = parent_name || '';
    reload = reload || 0;
    parent_object_name = parent_object_name || '';
    parent_object_type = parent_object_type || '';

    task = 'Task';
/*
    if (parent_ids.length == 1 || reload == 1){
        task = 'Task';
    }else{
        task = 'Tasks';
    }
*/

    data_ids = JSON.stringify(parent_ids);
    pparent_ids = JSON.stringify(pparent_ids);
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'parent_ids': data_ids ,'object_name': task, 'pparent_ids' : pparent_ids ,
        'parent_object_name': parent_object_name, 'parent_object_type': parent_object_type,
        'project': project_name
        },
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
		var details = {};
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
			    if (!details[index]){
				details[index] = {};
			    }
			    details[index]['bid'] = obj.bid;
			    details[index]['seconds'] = obj.seconds;
			    details[index]['client_status'] = obj.client_status;
                        }
                    });
                });
	    if (parent_name && parent_name != mycol[0]){
		mycol[0] = parent_name + ' <br>' + mycol[0] + ' <br><small style="color:aqua">(' + parent_type + ')<small>';
	    }
            add_rows(mycol,parent_id,mycolusers,task_id,task_parent_ids,details);
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

function create_row(obj){

    obj = obj || {};
    new_row = [];
    $('#tbl_task th').each(function(index) {
	if (!index){
	    return;
	}
	var task_name = this.innerHTML;
	
	task_status = '---';
	users = '---';
	status_label = 'label-default';
        if (obj.task_name == task_name){
	    task_status = obj.task_status;
	    users = obj.users;
	    status_label = 'label-' + task_status.replace(/ /g,"_").toLowerCase();
        }

	display = 'block';
	th_id = $(this).attr("class");
        if ($('#' + th_id).is(":not(:checked)")){
	    display = 'none';
        }

	status_cell = task_status;
	user_cell = users;
	if (display == 'block'){
	    new_row.push(status_cell);
	    new_row.push(user_cell);
	}
    });

    return new_row;
}

function add_rows(mycol,parent_id,mycolusers,task_id,task_parent_ids,details){

    var details = details || {};
    var obj_name = $("#selectObject").val();
    var project = $("#selectProject").val();
    var table = $('#tbl_task tbody');

    parent_object_type = obj_name;
    if (obj_name == 'Shot Asset Build')
	parent_object_type = 'Asset Build';

    row = $('<tr data-project="'+project+'" org-data="" task-id="'+parent_id+'" data-task-parent-id="'+parent_id+'" parent_object_type="'+parent_object_type+'"/>');
    table.prepend(row);

    $('#tbl_task th').each(function(index) {
        var th_name = $(this).text();
        var t_status = '---';
        var stat_lbl = 'label-default';
        var t_stat_user = '---';
        var stat_usr_lbl = 'label-default';
        var taskid = ''

	var bid = 0;
	var seconds = 0;
	var client_status = '---';
	if (details[index]){
	    bid = details[index]['bid'];
	    seconds = details[index]['seconds'];
	    client_status = details[index]['client_status'];
	}

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
	    // Comment for not to change status/user from task status
	    /*
                var header = this.innerHTML;
                col_arr = $('#user_columns').val().split(',');
                if (col_arr.indexOf(header) > -1){
                    on_click_status = "ondblclick='editCell(this)'";
                    on_click_user = "ondblclick='editUserCell(this)'";
                }
	    */
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

            var cell = $("<td title='"+th_name+"' data-client-status = '"+client_status+"' data-bid = '"+bid+"' data-shot-sec='"+seconds+"' data-task-id='"+taskid+"' data-org-val='"+t_status+"' data-parent-id='"+parent_id+"' data-id='show_status' "+show+" "+stat_display+" "+on_click_status+" />");

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

$('#selectFtpShot').on('change', function(evt, params) {

    var deselectedValue = params.deselected;
    var selectedValue = params.selected;

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
        $("#shot_asset_task").css({"display":"none"});
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
        $("#shot_asset_task").css({"display":"block"});
    toggle_selection2=1;
    });


})();

function remove_rows(tablename) {
    $(tablename).find("tbody tr").remove();
}

function load_types($select_elem){
    $select_elem.empty();
    $("#div_type_name").css({'display':'block'});

    $select_elem.append('<option value="">-- Select --</option>');
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
	    error_message("Please select valid project !!")
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
    }else if (obj_name == 'Ftp Shot'){
        $select_elem = $("#selectFtpShot");
        $div_name = $("#div_shot_name");
	task_name = $("#selectShotFtpDepartment").val();
	status_name = $("#selectFtpStatus").val();
    }else{
        return null
    }
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'project': project ,'object_name': obj_name , 'object_type' : select_type, 'parent_id' : parent_id, 'task_name': task_name, 'status_name': status_name, 'upload_for':client_final_combo},
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
function load_choosen_data($div_name, $select_elem, obj_name, parent_id, project, asset_type) {
    asset_type = asset_type || '';

    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'object_name': obj_name , 'parent_id' : parent_id, 'project': project, 'asset_type': asset_type},
        beforeSend: function(){
            $select_elem.empty();
	    $select_elem.append('<option value="">-- Select --</option>');
        },
        success: function(json){
            $div_name.css({'display':'block'});
            $.each(json, function (idx, obj) {
		opt_id = obj.id
		opt_text = obj.name
		opt_path = obj.path
		assignee = obj.task_assignee
		$select_elem.append('<option value="'+opt_id+'" task_assignee="'+assignee+'" data-path="'+opt_path+'">' + opt_text + '</option>');
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


function create_summary_div(div_check){

    $sum_div = $('#div_summary');

    col_val = $('#user_columns').val();
    col_arr = col_val.split(',');

    var task_data = '';
    $sum_div.html('');
    $(div_check+' input[type="checkbox"]').each(function() {
        if($.contains(document, this)){
            var header = this.value;
            if (col_arr.indexOf(header) > -1){
                show = "style='height:155px;'";
            }else{
                show = "style='display:none;height:155px;'";
            }

            var class_id = 'summary_' + $(this).attr('id');
	    task_data = task_data + '\
	    <div class="col-md-3 col-sm-3 col-xs-6 top-block '+class_id+' " '+show+'>\
<span style="color: chartreuse;font-size: 20px;">'+header+'</span>\
<div class="row">\
<div class="col-md-6" id="div_'+class_id+'"><div id="circle_'+class_id+'"  data-text="0%" data-percent="0" data-total="100" ></div></div>\
<div class="col-md-6" style="text-align: left;" ><div id="data_'+class_id+'"><br>Bids : 0 <br> Shots : 0 <br>Users : 0 <br> Hours : 00:00:00</div></div>\
</div></div>';

        }
    });

    $sum_div.html(task_data);
//    $("#demo").circliful();

    $(div_check+' input[type="checkbox"]').click(function() {
//        var index = $(this).attr('id').match(/\d+/)[0];
	check_id = $(this).attr('id');
	div_sum_id = 'summary_' + check_id;
	$('div.'+div_sum_id).toggle();
    });

}

function create_table(div_check) {

    var table = $('<table class="table-hover table-condensed table-bordered" id="tbl_task" />');

    thead = $('<thead />');
    tbody = $('<tbody />');

    var row = $(thead[0].insertRow(-1));

    var headerCell = $('<th name="Name" onclick="sortOrder(this)" title="Double Click to sort"/>');
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

            var value = $(this).attr('value');
            var truth = $('th').find(value).index();
            var truth = $('th[name^="'+value+'"]').index();
            truth = truth + 1;
            var checked = this.checked;

            $("#new_table tr").each(function(){
                if($('#new_table th[name="' + value + '"]').css('display') == 'none'){
                    if(checked){
                        $('#new_table th[name="' + value + '"]').css('display', 'table-cell');
                        $('.show_hide:nth-child('+truth+')').css('display','table-cell');
                    }
                    else{
                        $('#new_table th[name="' + value + '"]').css('display', 'none');
                        $('.show_hide:nth-child('+truth+')').css('display','none');
                    }
                    return false;
                }
                else{
                        $('#new_table th[name="' + value + '"]').css('display', 'none');
                        $('.show_hide:nth-child('+truth+')').css('display','none');
                }
                return false;
            });
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
}


function progress_bar(status_count_hash){

    $.each(status_count_hash, function(status_key, status_value){
		    $('#new_table th').each(function() {
		        th_name = $(this).attr('name');
		        var th_index = $(this).index();
		        var th_name_total = status_count_hash['Total'][th_name];
		        var val = status_value[th_name];

		        if(val){
		            $('#new_table tbody tr').find('td[status="'+status_key+'"]').find('.jqxProgressBar').progressbar({value:val, max: th_name_total});
		        }
		    });
    });
}

function create_new_table_status_count(div_check){

    var table = $('<table class="table-hover table-condensed table-bordered" id="new_table"/>');
    thead = $('<thead/>');
    tbody = $('<tbody />');

    var row = $(thead[0].insertRow(-1));

    var headerCell = $('<th style="width: 425px;" class="head_class" name="Status" title="Double Click to sort"/>');
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

    var statuses = ['Outsource','Outsource Reject','Outsource Approved','Outsource Client Reject','Outsource Client Review','Outsource Client Approved','Awaiting Data','Received Data','Ready to start','In progress','Ready to Publish','Pending Internal Review','Internal Reject','Internal Approved','Client Reject','Pending Client Review','Client approved','Completed','Total'];

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

    return new_status_hash
}

function show_task_summary(){

    var task_hash = {};
    $('#tbl_task td').each(function(index) {
	var td_type = $(this).attr('data-id');
	var td_name = $(this).text();
	var th_name = $(this).attr('title');

	if (td_name == '---'){
	    return;
	}
	if (td_type == 'show_status'){
	    var bid = $(this).attr('data-bid');
	    bid = parseFloat(bid); 
	    var shot_sec = $(this).attr('data-shot-sec');
	    shot_sec = parseFloat(shot_sec); 

	    if(!task_hash[th_name])
		task_hash[th_name] = {};

	    if(!task_hash[th_name]['approved'])
		task_hash[th_name]['approved'] = 0;

	    if (td_name == 'Client approved')
		task_hash[th_name]['approved']++;

	    if(!task_hash[th_name]['bid']){
		task_hash[th_name]['bid'] = bid;
	    }else{
		task_hash[th_name]['bid'] = task_hash[th_name]['bid'] + bid
	    }
	    if(!task_hash[th_name]['sec']){
		task_hash[th_name]['sec'] = shot_sec;
	    }else{
		task_hash[th_name]['sec'] = task_hash[th_name]['sec'] + shot_sec
	    }
	    if(!task_hash[th_name]['shots']){
                task_hash[th_name]['shots'] = 1;
            }else{
                task_hash[th_name]['shots']++;
            }
	}
	if (td_type == 'show_assignee'){
	    if(!task_hash[th_name]['users']){
		task_hash[th_name]['users'] = td_name;
	    }else{
		task_hash[th_name]['users'] = task_hash[th_name]['users'] + ',' + td_name
	    }
	}
    });

    $('#tbl_task th').each(function(index) {
	if(index==0){
	    return;
	}
	var head = $(this).text();
	var class_id = $(this).attr('class');
	var circle_class_id = 'circle_summary_' + class_id;
	var data_class_id = 'data_summary_' + class_id;
	var div_class_id = 'div_summary_' + class_id;

	var hours = '00:00:00';
	var shots = 0;
	var bid = 0;
	var percent = 0;
	var c_users = 0;
	
	if(task_hash[head]){
	    if (!task_hash[head]['users']){
		users = [];
	    }else{
		users = task_hash[head]['users'].split(',');
		users = $.unique(users);
	    }
	    c_users = users.length;

	    hours = secondsTimeSpanToHMS(parseInt(task_hash[head]['sec']));
	    shots = task_hash[head]['shots'];
	    bid = task_hash[head]['bid'];
	    approved = task_hash[head]['approved'];
	    percent = (approved / shots)  * 100;
	}
	bid = bid.toFixed(2);
	$('#'+data_class_id).html('<br>Bids : '+bid+' <br> Shots : '+shots+' <br>Users : '+c_users+' <br> Hours : '+hours);

	$('#'+circle_class_id).remove();
	$('#'+div_class_id).append('<div id="'+circle_class_id+'"></div>');
//	$('#'+circle_class_id).attr('data-text',percent+'%');
	$('#'+circle_class_id).attr('data-percent',percent);

	$('#'+circle_class_id).circliful();

    });

}
function show_graphs(){

    show_task_summary();
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
    var page = $('#task_menu1').find('li.active').first('a span').text()
    var project = $('#data-modal-object-id').attr("data-modal-project");
    data = JSON.stringify(data_array);
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'object_name': object_name, 'data_list': data, 'project': project, page},
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

$("#search_activity").keyup(function(){
    _this = this;
   if ($(this).val() === ''){
        $(this).css({"border-color": "#333"})
    }else{
        $(this).css({"border-color": "#5897fb"})
    }
    $.each($("#tbl_activity tbody tr"), function(idx) {
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
$('#div_task_enitity_details').on('scroll', function(){
   var translate = "translate(0,"+this.scrollTop+"px)";
   this.querySelector("thead").style.transform = translate;
});
$('#version_details').on('scroll', function(){
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

$("#div_asset_build_details").on('scroll', function(){
   var translate = "translate(0,"+this.scrollTop+"px)";
   this.querySelector("thead").style.transform = translate;
});

$("#div_shot_build_details").on('scroll', function(){
   var translate = "translate(0,"+this.scrollTop+"px)";
   this.querySelector("thead").style.transform = translate;
});
$("#div_dash_outsource_sequence_details").on('scroll', function(){
   var translate = "translate(0,"+this.scrollTop+"px)";
   this.querySelector("thead").style.transform = translate;
});
$("#div_dash_outsource_asset_build_details").on('scroll', function(){
   var translate = "translate(0,"+this.scrollTop+"px)";
   this.querySelector("thead").style.transform = translate;
});
$('#activity_logs_details').on('scroll', function(){
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
function add_note(context){

    attr_id = $(context).attr('id');
    id = attr_id.split('-')[1]
    ver_id = $('#selectVersion-'+id).val();
    note = $('#reject_note-'+id).val();
    if (ver_id == ''){
	error_message("Please select version !!");
	return null;
    }
    if (note == ''){
	error_message("Note is empty !!");
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
	error_message("Please select version !!");
	return null;
    }
    if (note == ''){
	error_message("Note is empty !!");
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


function show_upload_version(){

    $('#tbl_ftp_version tbody').empty();

    proj = $('#selectProject').val();
    stat = $('#selectFtpStatus').val();
    ass = $('#selectFtpAssetName').val();
    ext = $('#selectFtpExt').val();
    side = $('#selectFtpVersionSide').val();
    dest_path = $('#dest_path').val();
    dest_path = dest_path.replace(/\s/g,'');

    if (!proj){
	error_message("Please select project !!!");
	return null;
    } else if (!stat){
	error_message("Please select status !!!");
	return null;
    } else if (!ass){
	error_message("Please select asset name !!!");
	return null;
    } else if (!ext){
	error_message("Please select Components !!!");
	return null;
    } else if (!dest_path){
	error_message("Please valid destination path !!!");
	return null;
    }

    var data_array = [];
    obj = $('#selectFtpObject').val();

    if (obj == 'Shot'){
	dept = $('#selectShotFtpDepartment').val();
	seq = $('#selectFtpSequence').val();
	shot = $('#selectFtpShot').val();
	if (!dept){
	    error_message("Please select department !!!");
	    return null;
	} else if (!seq){
	    error_message("Please select Sequence !!!");
	    return null;
	} else if (!shot){
	    error_message("Please select shot !!!");
	    return null;
	} else if ($("#selectShotFtpDepartment").val() == 'Lighting' && !side){
	    error_message("Please select side !!!");
	    return null;
	}
	for (i in shot){
	    value = shot[i];
	    task_id = $("#selectFtpShot option[value='"+value+"']").attr('data-task-id');
	    name = $("#selectFtpShot option[value='"+value+"']").text();
	    str_ver = proj+'|'+name+'|'+task_id+'|'+stat+'|'+ass+'|'+ext+'|'+side;
	    data_array.push(str_ver);
	}
    }else if (obj == 'Asset Build'){
	dept = $('#selectAssetFtpDepartment').val();
	type = $('#selectFtpType').val();
	asset = $('#selectFtpAsset').val();
	if (!dept){
	    error_message("Please select department !!!");
	    return null;
	} else if (!type){
	    error_message("Please select Asset Type !!!");
	    return null;
	} else if (!asset){
	    error_message("Please select Asset Build !!!");
	    return null;
	}
	for (i in asset){
	    value = asset[i];
	    task_id = $("#selectFtpAsset option[value='"+value+"']").attr('data-task-id');
	    name = $("#selectFtpAsset option[value='"+value+"']").text();
	    str_ver = proj+'|'+name+'|'+task_id+'|'+stat+'|'+ass+'|'+ext+'|'+side;
	    data_array.push(str_ver);
	}
    }
    load_ftp_versions(data_array);
}


function load_ftp_versions(data_array) {

    project = $('#selectProject').val();
    data_array = JSON.stringify(data_array);
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'data_array': data_array ,'object_name': 'Ftp Versions', 'project': project },
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

    var table = $('#tbl_ftp_version tbody');
    row = $(table[0].insertRow(-1));

    upload_error = obj.upload_error
    camera_angle = obj.camera_angle
    obj_name = obj.name
    upload_status = obj.status
    upload_version = obj.upload_version
    published_by = obj.published_by
    published_version = obj.published_version
    source_path = obj.source_path
    version_id = obj.version_id
    task_id = obj.task_id

    upload_color = "style='color:#00ff03;'";

    check_box = '<input type="checkbox" id="cb'+idx+'" data-source-path="'+source_path+'" data-version-id="'+version_id+'" data-task-id="'+task_id+'"/>';
    if (upload_error == 1){
	check_box = '<span id="cb'+idx+'"/>';
	upload_color = "style='color:red;'";
    }

    var cell = $("<td id='check_box_1'>"+check_box+"</td><td>"+obj_name+"</td><td>"+published_version+"</td><td>"+upload_version+"<td nowrap "+upload_color+">"+upload_status+"</td><td>"+published_by+"</td>");

    row.append(cell);

}

$('#upload_ftp').click(function(){
    $('#upload_ftp').prop("disabled",true);

    dest_path = $('#dest_path').val();
    dest_path = dest_path.replace(/\s/g,'');

    camera_side = $('#selectFtpVersionSide').val();

    upload_for = $('#selectFtpStatus').val();
    project = $('#selectProject').val();

    var dest_upload_path = dest_path.split('/');
    if (dest_path.slice(0,2) == 'Z:'){
        dest_upload_path = dest_path.split('\\');
    }

    var ftp_version = []

    obj = $('#selectFtpObject').val();
    var dept = '';
    if (obj == 'Shot'){
	dept = $('#selectShotFtpDepartment').val();
    }else if (obj == 'Asset Build'){
	dept = $('#selectAssetFtpDepartment').val();
    }

    $('tbody tr td input[type="checkbox"]').each(function(){
	if($(this).prop('checked')){
	    data = {};
	    data['task_id'] = $(this).attr('data-task-id');
	    data['version_id'] = $(this).attr('data-version-id');
	    data['source_path'] = $(this).attr('data-source-path');
	    data['camera_angle'] = camera_side;
	    data['upload_for'] = upload_for;
	    data['department'] = dept;
	    data['project'] = project;
	    current_row = $(this).closest('tr');
	    data['obj_name'] = current_row.find("td:eq(1)").text();
	    data['upload_version'] = current_row.find("td:eq(3)").text();
	    data['internal_version'] = current_row.find("td:eq(2)").text();
	    data['dest_upload_path'] = dest_upload_path;

	    ftp_version.push(data);
	}
    });
	if(!(ftp_version.length)){
	    error_message("Select files after clicking on 'Show' button")
	    return null
	}
    upload_files(ftp_version, dest_upload_path)

});


function upload_files(data_array, dest_upload_path) {
    data_array = JSON.stringify(data_array);
    dest_upload_path = JSON.stringify(dest_upload_path);
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'data_array': data_array ,'object_name': 'Ftp Upload', 'dest_upload_path': dest_upload_path },
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

//------------- model calls --------------------------//
function show_model(context){
    task_id = $(context).closest('td').attr('data-task-id');

    if (!task_id || task_id == 'null'){
	alert("Selected task is not created !!!");
	return null;
    }
    reset_model_drop_down();

    last_row = 15;
    task_parent_id = $(context).closest('td').attr('data-task-parent-id');
    task_assignee = $(context).closest('td').attr('data-task-assignee');
    parent_object_type = $(context).closest('tr').attr('data-parent-object-type');
    project = $(context).closest('tr').attr('data-project');

    // Header details
    load_task_details(project, task_id);

    // default Task Note Tab
    load_task_notes(task_id, last_row, project);

    load_choosen_data($('#div_selectVersionTask'),$('#selectVersionTask'), "Select Task", task_parent_id, project);
    load_choosen_data($('#div_selectNoteTask'),$('#selectNoteTask'), "Select Task", task_parent_id, project);
    load_choosen_data($('#div_selectTask'),$('#selectTask'), "Select Task", task_parent_id, project);
    load_choosen_data($('#div_selectActivityTask'),$('#selectActivityTask'), "Select Task", task_parent_id, project);

    // user_reject_asset
    $('#user_reject_asset').attr('data-task-parent-id',task_parent_id);
    if (parent_object_type == 'Shot'){
	$('#div_user_reject_asset').css({'display':'block'});
	$('#user_reject_asset').attr('checked',false);
    }else{
	$('#div_user_reject_asset').css({'display':'none'});
    }

    $('#btn_note_create').attr('data-task-id',task_id);

    $('#myModal').modal('show');
};

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

//------------- load on model pop up --------------------------//
function load_task_details(project, task_id){
    $("#task_details_loader").show();
    $.ajax({
	type: "POST",
	url:"/callajax/",
	data: { 'project': project, 'task_id': task_id , 'object_name': 'Show Task Details'},
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
    
    html = '<input type="hidden" id="data-modal-object-id" data-modal-project="'+obj.project+'" data-parent-object="'+obj.parent_object+'" data-modal-parent-id="'+obj.parent_id+'" task_parent_path="'+obj.parent_path+'" value="'+obj.object_id+'" />\
	    <br><h4 id="from-id">'+obj.link_path+'</h4>';

    $('#modal_header').html(html);


    // for artist page
    parent_name = obj.link_path.split(':');
    last_idx = parent_name.length - 1; 
    task_name = parent_name[last_idx];
    $select_elem = $('#selectAssetTypes');
    load_asset_type(task_name, $select_elem);
}

//------------- tabs change calls --------------------------//

    // tab-1
$('#my_not').on('click', function() {
    task_id = $('#data-modal-object-id').val();
    project = $('#data-modal-object-id').attr("data-modal-project");
    last_row = 15;
    $('#note_details').html('');
    if ($('#selectNoteTask').val() && task_id != $('#selectNoteTask').val()){
	task_id = $('#selectNoteTask').val();
    }
    load_task_notes(task_id, last_row, project);
    $('#btn_note_create').attr('data-task-id',task_id);
});

$('#note_details').on('scroll', function() {
    task_id = $('#data-modal-object-id').val();
    project = $('#data-modal-object-id').attr("data-modal-project");
    if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
	last_row += 15
	if ($('#selectNoteTask').val() && task_id != $('#selectNoteTask').val()){
	    task_id = $('#selectNoteTask').val();
	    last_row = 15;
	    $('#note_details').html('');
	}
	load_task_notes(task_id, last_row, project);
    }
});

$('#selectNoteCategory').on('change', function(){
    task_id = $('#data-modal-object-id').val();
    project = $('#data-modal-object-id').attr("data-modal-project");
    last_row = 15;
    if ($('#selectNoteTask').val() && task_id != $('#selectNoteTask').val()){
	task_id = $('#selectNoteTask').val();
    }
    $('#note_details').html('');
    load_task_notes(task_id, last_row, project);
    $('#btn_note_create').attr('data-task-id',task_id);

});

$('#selectNoteTask').change(function(){
    task_id = $('#data-modal-object-id').val();
    project = $('#data-modal-object-id').attr("data-modal-project");
    last_row = 15;
    if ($(this).val() && task_id != $(this).val()){
	task_id = $(this).val();
    }
    $('#note_details').html('');
    load_task_notes(task_id, last_row, project);
    $('#btn_note_create').attr('data-task-id',task_id);
});

function load_task_notes(task_id, last_row, project){

    note_on = 'Task'
    note_category = $('#selectNoteCategory').val();

    $("#task_notes_loader").show();
    $.ajax({
	type: "POST",
	url:"/callajax/",
	data: { 'task_id': task_id , 'object_name': 'Show Note Details' , 'last_row' : last_row, 'note_category': note_category, 'project' : project, 'note_on': note_on},
	success: function(json){
	$.each(json, function (idx, obj) {
	    modal_body = add_note_details(idx, obj);
	    $('#note_details').append(modal_body);
	});
	$("#task_notes_loader").hide();
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
	create_task_note(task_id);
    }
});

function create_task_note(task_id){
    $textarea_id = $('#text_artist_note');
    $div_element = $('#note_details');
    var note_text = $textarea_id.val().trim();
    var note_category = $('#selectNoteCategory').val();
    if (!(note_text.length && task_id)){
	error_message("invalid note ...");
	return null;
    }
    if (!(note_category)){
	error_message("Please select valid category ...");
	return null;
    }

    attachments = [];
    $textarea_id.parent().find('table[id=gallery_notes] tr td a').each(function(){
	href = $(this).attr('href');
	attachments.push(href);
    });

    note_on = 'Task'
    attach_files = JSON.stringify(attachments);
    create_new_note(task_id, note_text, note_category, note_on, $div_element, attach_files);
    $textarea_id.parent().find('table[id=gallery_notes] tbody').html('');
    $textarea_id.val('');

}

function create_new_note(entity_id, note_text, note_category, note_on, $div_element, attach_files, from_task, to_task, change_status){
    var page = page || $('#task_menu1').find('li.active').first('a span').text().trim();
    project = $('#data-modal-object-id').attr("data-modal-project");
    note_id = '';
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'object_name': 'Create Note', 'entity_id': entity_id, 'note_text': note_text, 'note_category': note_category, 'note_on': note_on, "attach_files": attach_files, "page": page, "project": project, 'from_task': from_task, 'to_task': to_task, 'change_status': change_status},
        beforeSend: function(){
        },
        success: function(json){
            $.each(json, function (idx, obj) {
		modal_body = add_note_details(idx, obj);
		$div_element.prepend(modal_body);
            });
            noty({
                text: 'Note on task added successfully ...',
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
    project = obj.project;

    if (obj.note_components.length > 0){
	component = '';
	for (k in obj.note_components){
	    my_url = obj.note_components[k].url;
	    file_type = obj.note_components[k].file_type;
	    if (file_type == '.mov'){
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
	    obj_reply = obj.replies[j];
	    reply_text = obj_reply.reply_text;
	    reply_user = obj_reply.reply_by;
	    reply_on = obj_reply.reply_on;
	    reply = reply + '<p>'+reply_text+'<span style="float:right;">'+reply_user+' [ '+reply_on+' ]</span></p>';
	}
    }

    note_textarea = "text_artist_note-" + note_id;
    do_reply = '\
                                            <table> \
                                                <tr> \
                                                    <td style="width: 100%;"> \
                                                        <textarea id="'+note_textarea+'" rows="4" cols="20" placeholder="Write a comment..." class="x-form-field x-form-text x-form-textarea" autocomplete="off" style="width: 100%; height: 48px;"></textarea> \
                                                    </td> \
                                                    <td> \
                                        <button class="btn btn-inverse btn-default btn-lg" id="btn_note_reply" onclick="reply_note(\''+project+'\',\''+note_id+'\',\''+note_textarea+'\')" style="width: 60px;"> \
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

    style = 'style="width:80%"';
    if (task_name){
	style = 'style="width:60%"';
    }

    var del_var = '';
    if(note_author == current_user){
        del_var = '<button class="btn btn-xs btn-danger" style="float\:right;" id="delete-note" onclick="delete_note(this)" note-id="'+note_id+'" project-name="'+project+'">Delete</button>'
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
    var cnf = confirm("Are you sure. You want to delete this note!");
    var page = $('#task_menu1').find('li.active').first('a span').text().trim();
    if (cnf == true) {
        var note_id = $(param).attr('note-id');
        var project = $(param).attr('project-name');

        // call ajax
        $.ajax({
        type: "POST",
        url:"/callajax/",
        data: { 'object_name': 'Delete Note' ,'note_id': note_id, 'project': project, 'page': page},
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

function reply_note(project, note_id, note_textarea){

    var reply_text = $('#'+note_textarea).val().trim();
    if (!(reply_text.length && note_id)){
	error_message("invalid note ...");
	return null;
    }

    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'object_name': 'Reply Note', 'note_id': note_id, 'reply_text': reply_text, 'project': project},
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
	    $('#'+note_textarea).val('');
        },
        error: function(error){
            console.log("Error:");
            console.log(error);
        }
    });
    $textarea_id.val('');
    user = $('#note_details').attr('data-user-id').toLowerCase();
    current_date = moment().format('YYYY-MM-DD HH:mm:ss');
    my_reply = '<p>'+user+' :- '+reply_text+'<span class="label" style="float:right;">'+current_date+'</span></p>';
    $('#note_replies-'+my_note_id).append(my_reply);

}

    // tab-2
$('#my_lnk').on('click', function() {
    var page = $('#task_menu1').find('li.active').first('a span').text()
    page = page.trim()
    parent_id = $('#data-modal-object-id').attr('data-modal-parent-id');
    if (page == 'Task Status'){
	parent_id = $('#data-modal-object-id').val();
    }
    last_row = 15;
    $('#link_details').html('');
    load_task_links(parent_id, last_row)

});

function load_task_links(task_id, last_row){
    project = $('#data-modal-object-id').attr("data-modal-project");
    $("#task_link_loader").show();
    body_row_array = []
    asset_ids_array = []
    $.ajax({
	type: "POST",
	url:"/callajax/",
	data: { 'task_id': task_id , 'object_name': 'Show Tab Link Details' , 'last_row' : last_row, 'project': project},
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
    not_div = '';
    $.each(obj.notes, function (idx, ob){
                modal_body = add_note_details_history(idx, ob);
                console.log(modal_body)
               not_div = not_div +  modal_body
            });

    link = '<span class="label label-None" style="width:100%">'+obj.name+'</label>';
    body_row = '\
	<div class="panel panel-default" id="link_category-'+idx+'">\
            <div class="panel-heading">\
                <a data-toggle="collapse" data-parent="#link_accordion" href="#link_collapse1-'+idx+'" style="text-decoration: none;">'+link+'</a>\
            </div>\
	    <div id="link_collapse1-'+idx+'" class="panel-collapse collapse">'+not_div+'\
	    </div>\
	</div>\
    ';

    return body_row;
}
    // tab-3
$('#my_vsn').on('click', function() {
    task_id = $('#data-modal-object-id').val();
    project = $('#data-modal-object-id').attr('data-modal-project');

    if($('#selectTask').val() && task_id != $('#selectTask').val()){
	task_id = $('#selectTask').val();
    }

    load_asset_versions(task_id, project);
});

$('#selectAssetTypes').on('change', function() {
    task_id = $('#data-modal-object-id').val();
    project = $('#data-modal-object-id').attr('data-modal-project');

    if($('#selectTask').val() && task_id != $('#selectTask').val()){
	task_id = $('#selectTask').val();
    }

    load_asset_versions(task_id, project);
});

$('#selectTask').change(function(){
    task_id = $(this).val();
    project = $('#data-modal-object-id').attr('data-modal-project');

    load_asset_versions(task_id, project);

    parent_name = $('#selectTask option:selected').text();
    $select_elem = $('#selectAssetTypes');
    load_asset_type(parent_name, $select_elem);
});

function load_asset_versions(task_id, project){
    asset_type = $('#selectAssetTypes').val();
    $.ajax({
	type: "POST",
	url:"/callajax/",
	data: { 'task_id': task_id , 'object_name': 'Show Asset Versions' , 'asset_type' : asset_type, 'project': project},
	beforeSend: function(){
            remove_rows('#tbl_versions');
	    $("#version_loader").show();
            if ($.fn.DataTable.isDataTable("#tbl_versions")){
                get_table_header().clear().draw();
                get_table_header().destroy();
            }
        },
	success: function(json){
	    $.each(json, function (idx, obj) {
		add_version_details(idx, obj);
	   });
	    $("#version_loader").hide();
	},
	complete: function(){
	    create_datatable('tbl_versions');
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
    // tab-4
$('#my_vsn_not').on('click', function() {
    task_id = $('#data-modal-object-id').val();
    project = $('#data-modal-object-id').attr('data-modal-project');
    $('#note_attach').val('');
    $('#version_note_details').html('');
    last_row = 15;
    if ($('#selectVersionTask').val() && task_id != $('#selectVersionTask').val()){
	task_id = $('#selectVersionTask').val();
    }

    load_version_notes(task_id, last_row, project);

});

$('#user_reject_asset').change(function(){
    task_parent_id = $(this).attr('data-task-parent-id');
    project = $('#data-modal-object-id').attr('data-modal-project');
    reset_model_drop_down();
    if($(this).prop('checked')){

	load_choosen_data($('#div_selectVersionAssetBuild'),$('#selectVersionAssetBuild'),'Show Link Details', task_parent_id, project);

        select_task_elem = $('#selectVersionTask');
        select_task_elem.empty();
        select_task_elem.trigger("chosen:updated");
	$('#selectVersionAssetBuild_chosen').css({"width":"200px"});
    }else{
	load_choosen_data($('#div_selectVersionTask'),$('#selectVersionTask'),'Select Task',task_parent_id, project);

        select_elem = $('#selectVersionTaskAssetTypes');
        $select_elem.empty();
	$select_elem.append('<option value="">-- Asset Type --</option>');
    }

});

$('#selectVersionAssetBuild').change(function(){
    project = $('#data-modal-object-id').attr('data-modal-project');
    asset_id = $(this).val();
    if (asset_id){
	load_choosen_data($('#div_selectVersionTask'), $('#selectVersionTask'), 'Select Task', asset_id, project);
    }
});

$('#selectVersionTask').change(function(){
    task_id = $(this).val();
    project = $('#data-modal-object-id').attr('data-modal-project');
    $('#note_attach').val('');
    $('#version_note_details').html('');
    last_row = 15;
    load_version_notes(task_id, last_row, project);

    parent_name = $('#selectVersionTask option:selected').text();
    $select_elem = $('#selectVersionTaskAssetTypes');
    load_asset_type(parent_name, $select_elem);
});

function load_asset_type(parent_name, $select_elem){

    parent_object = $('#data-modal-object-id').attr('data-parent-object');
    if (parent_object == 'Sequence'){
	parent_object = 'Shot';
    }

    if ($('#user_reject_asset').prop("checked") || parent_object == 'Project'){
	parent_object = 'Asset Build';
    }

    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'parent_name' : parent_name, 'parent_object': parent_object, 'object_name': 'Asset Type'},
        beforeSend: function(){
	    $select_elem.empty();
	    $select_elem.append('<option value="">-- Select --</option>');
        },
        success: function(json){
            $.each(json, function (idx, obj) {
		    $select_elem.append('<option value="'+obj.name+'">' + obj.name + '</option>');
            });
            $select_elem.trigger("chosen:updated");
            $select_elem.trigger("liszt:updated");
//            $select_elem.data("chosen").destroy().chosen();
        },
        error: function(error){
            console.log("Error:");
            console.log(error);
        }
    });

}

$('#selectVersionTaskAssetTypes').change(function(){
    asset_type = $(this).val();
    task_id = $('#data-modal-object-id').val();
    project = $('#data-modal-object-id').attr('data-modal-project');
    last_row = 15;
    if ($('#selectVersionTask').val() && task_id != $('#selectVersionTask').val()){
	task_id = $('#selectVersionTask').val();
    }
    load_choosen_data($('#div_selectTaskVersion'),$('#selectTaskVersion'), "Show Latest Asset Version", task_id, project, asset_type);
});


$('#selectVersionNoteCategory').change(function(){
    task_id = $('#data-modal-object-id').val();
    project = $('#data-modal-object-id').attr("data-modal-project");
    $('#note_attach').val('');
    $('#version_note_details').html('');
    last_row = 15;
    if ($('#selectVersionTask').val() && task_id != $('#selectVersionTask').val()){
	task_id = $('#selectVersionTask').val();
    }
    load_version_notes(task_id, last_row, project);

});

$('#version_note_details').on('scroll', function() {
    task_id = $('#data-modal-object-id').val();
    project = $('#data-modal-object-id').attr("data-modal-project");
    if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
	last_row += 15;
	if ($('#selectVersionTask').val() && task_id != $('#selectVersionTask').val()){
	    task_id = $('#selectVersionTask').val();
	    last_row = 15;
	    $('#version_note_details').html('');
	}
        load_version_notes(task_id, last_row, project);
    }
});

function load_version_notes(task_id, last_row, project){

    note_on = 'Version'
    note_category = $('#selectVersionNoteCategory').val();

    $("#task_notes_loader").show();
    $.ajax({
	type: "POST",
	url:"/callajax/",
	data: { 'task_id': task_id , 'object_name': 'Show Note Details' , 'last_row' : last_row, 'note_category': note_category, 'project' : project, 'note_on': note_on},
	success: function(json){
	$.each(json, function (idx, obj) {
	    modal_body = add_note_details(idx, obj);
	    $('#version_note_details').append(modal_body);
	});
	$("#task_notes_loader").hide();
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
	create_version_note(version_id);
    }else{
	error_message("Please select version !!!");
	return null;
    }

});

function create_version_note(version_id){

    $textarea_id = $('#text_version_note');
    $div_element = $('#version_note_details');
    var note_text = $textarea_id.val().trim();
    task_for = $('#selectVersionNoteCategory').attr('data-for-artist');
    if (task_for == 'to_do'){
        var note_category = 'Internal';
    }
    else{
        var note_category = $('#selectVersionNoteCategory').val();
    }

    if (!(note_text.length && version_id)){
	error_message("invalid note ...");
	return null;
    }
    if (!(note_category)){
	error_message("Please select valid category ...");
	return null;
    }

    attachments = [];
    $textarea_id.parent().find('table[id=gallery_versions] tr td a').each(function(){
	href = $(this).attr('href');
	attachments.push(href);
    });

    attach_files = JSON.stringify(attachments);

    from_task = $('#from-id').text();
    to_task = $('#selectVersionTask option:selected').attr('data-path');

    change_status = ''
    // for internal reject
    if($('#internal-reject').prop("checked") == true){
	change_status = 'Internal Reject';
    }

    note_on = 'Version';
    create_new_note(version_id, note_text, note_category, note_on, $div_element, attach_files, from_task, to_task, change_status);

    $textarea_id.parent().find('table[id=gallery_versions] tbody').html('');
    $textarea_id.val('');

}

    // tab-5
$('#my_vsn_not_htry').on('click', function() {
    var from_task = $('#from-id').text();
    last_row = 15;
    $('#version_note_details_history').html('');
    get_version_note_details_history(from_task, last_row)
});

$('#version_note_details_history').on('scroll', function() {
    if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
       last_row += 15;
        var from = $('#from-id').text();
        get_version_note_details_history(from, last_row)
    }
});

function get_version_note_details_history(from_task, last_row){
    var page = $('#task_menu1').find('li.active').first('a span').text().trim();
    project = $('#data-modal-object-id').attr("data-modal-project");
    $("#task_version_notes_history_loader").show();
    $.ajax({
	type: "POST",
	url: "/callajax/",
	data: {"object_name": "Note History", "from_task": from_task, 'last_row': last_row, "page": page, "project": project},
	beforeSend: function(){

	},
	success: function(json){
	     $.each(json, function (idx, obj){
                modal_body = add_note_details_history(idx, obj);
                $('#version_note_details_history').append(modal_body);
        	});
	$("#task_version_notes_history_loader").hide();
	},
	error: function(error){
	    console.log("Error:"+error);
	}
    });
}

function add_note_details_history(idx, obj){
    note_status = obj.status;
    note_added_on = obj.added_on;
    note_department = obj.department;
    note_added_by = obj.added_by;
    note_task_path = obj.task_path;
    note_text = obj.note_text;
    style = 'style="width:60%"';
    label_status = note_status.replace(/ /g,"_").toLowerCase();
    modal_body = '\
	<div class="box row" id="" >\
	    <span class="label label-info" >'+note_department+'</span>\
	    <span class="label label-'+label_status+'" '+style+'>'+note_status+'</span> \
	    <span class="label label-info" style="float\:right;">'+note_added_on+'</span>\
	    <p>'+note_text+'</p>\
	    <div class="box row"><strong>'+note_task_path+'</strong><button class="btn btn-xs btn-primary" style="float\:right;">'+ note_added_by +'</button></div>\
	</div>\
    ';

    return modal_body;
}
 // tab-6
$('#my_activity').on('click', function() {
    var task_id = $('#data-modal-object-id').val();
    if ($("#selectActivityTask").val()){
	task_id = $("#selectActivityTask").val();
    }
    
    get_activity_details(task_id);

});

$("#selectActivityTask").change(function(param){
    var task_id = $(this).val()

    get_activity_details(task_id)
 });

function get_activity_details(task_id){
    project = $('#data-modal-object-id').attr("data-modal-project");
    $.ajax({
	type: "POST",
	url: "/callajax/",
	data: {"object_name": "Activity Log", "task_id": task_id, "project": project},
	beforeSend: function(){
	    remove_rows('#tbl_activity');
            $("#my_activity_loader").show();
            if ($.fn.DataTable.isDataTable("#tbl_activity")){
                get_table_header().clear().draw();
                get_table_header().destroy();
            }
	},
	success: function(json){
	     $.each(json, function (idx, obj){
                add_activity_logs(idx, obj);
            });
	},
	complete: function(){
	    create_datatable('tbl_activity');
	    $("#my_activity_loader").hide();
	},
	error: function(error){
	    console.log("Error:"+error);
	}
    });
}

function add_activity_logs(idx, obj){
    details_for = obj.details_for;
    activity_date = obj.activity_date;
    activity_by = obj.activity_by;
    action = obj.action;
    path = obj.path;
    value = obj.value;

    var table = $('#tbl_activity tbody');

    row = $(table[0].insertRow(-1));
    row.attr('id',details_for)

    enable_dblclick = ''

    row_data = '\
	  <td nowrap >'+path+'</td> \
	  <td class="center">'+activity_by+'</td> \
	  <td class="center">'+action+'</td> \
	  <td class="center">'+details_for+'</td> \
	  <td><span class="label label-default" style="overflow:auto">'+value+'</span></td>\
	  <td class="center" nowrap>'+activity_date+'</td> \
	'
	row.append(row_data);
}

//category for tab-1
//----------- close model ---------------//
$('#myReset').on('click', function() {
        $('#myModal').hide("");
        $('#modal_header').html('');
        $('#selectVersionTask').html('');
        $('#selectNoteTask').html('');

        $('.nav-tabs li.active').removeClass('active');
        $('.nav-tabs li a[href="#my_notes"]').tab('show')
    });

//--------- get asset list ------------------//
function get_asset_list(prj_name, asset_ids){
    var asset_array = asset_ids.join();
    $('#myList').html('');
    checked_list = [];
    unchecked_list = [];
    //call
    $.ajax({
	type: "POST",
	url:"/callajax/",
	data: { 'object_name': 'Asset Build' , 'project': prj_name},
	success: function(json){
        var ids = []
        $.each(json, function (idx, obj){
            if(jQuery.inArray(obj.id, asset_ids) !== -1){
            checked_list.push('<li class="list-group-item"><input type="checkbox" name="asset" value="'+obj.id+'" checked/>&nbsp;'+obj.name+'</li>')
            ids.push(obj.id)
            }
            else{
              unchecked_list.push('<li class="list-group-item"><input type="checkbox" name="asset" value="'+obj.id+'"/>&nbsp;'+obj.name+'</li>')
            }
        });
        $('#myList').attr('data-checked', ids);
        checked_list.push(unchecked_list);
        for (i = 0; i < checked_list.length; i++) {
         $('#myList').append(checked_list[i]);
        }
        $("#linktask_details_loader").hide();
        $('#linkModel').modal('show');
        $('#entity_loader').hide();
	},
	error: function(error){
	    console.log("Error:");
	    console.log(error);
	}
    });
}
function add_entity_asset_link(param){
    var task_id = $('#save_asset').attr('task-id');
    var obj_name = $('#selectEntityObject').val();
    var asset_name = $('#selectEntityObject').val();
    var parent_path = $(param).attr('parent_path')
    var tr_id = $(param)
    var old_asset_ids = ""
    if($('#save_asset').attr('old-ids')){
        old_asset_ids = ($('#save_asset').attr('old-ids')).split(",");
    }
    add_asset(task_id, obj_name, asset_name, old_asset_ids, parent_path)
};

//-------- add asset ------------------- //
function add_asset(task_id, obj_name, asset_name, old_asset_ids, parent_path=''){
    var page = $('#task_menu1').find('li.active').first('a span').text().trim();
    var prj_name = $("#selectEntityProject option:selected").text();
    var proj_id = $("#selectEntityProject").val();
    $("#linktask_details_loader").show();
    if (obj_name){
	if (obj_name == 'Shot Asset Build'){
	    obj_name = 'Asset Build';
	}
    }else{
	obj_name = 'Task';
    }
    if(old_asset_ids){
        old_asset_ids = old_asset_ids.join();
    }
    var selected_asset = [];
    $.each($("input[name='asset']:checked"), function(){
        selected_asset.push($(this).val());
    });
    //call
    $.ajax({
	type: "POST",
	url:"/callajax/",
	data: { 'object_name': 'Link Asset' , 'task_id': task_id, 'selected_asset': selected_asset.join(), 'project': prj_name, "page": page},
	success: function(json){
	    $("#linktask_details_loader").hide();
	    // Reload task links
        if(page == 'entity_task'){
         load_task_links(task_id,obj_name,15);
        }else{
          $('#incoming').attr('asset-ids', selected_asset);
          $('#save_asset').attr('old-ids', selected_asset)
          get_asset_list(prj_name, selected_asset)
        }
        noty({
                text: 'Asset Link added successfully',
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


//----------- for filter asset list ----------//
$(document).ready(function(){
  $("#myInput").on("keyup", function() {
    var value = $(this).val().toLowerCase();
    $("#myList li").filter(function() {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
    });
  });
});


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



//----------
$('#tab_shot_reports').click(function(){
    $('#download_user_task').attr("onclick","$('#tbl_shot_task').table2excel({filename: 'artist_prod_shot',exclude: '.noExl'});");
});

$('#tab_asset_build_reports').click(function(){
    $('#download_user_task').attr("onclick","$('#tbl_asset_build_task').table2excel({filename: 'asset_build_prod_shot',exclude: '.noExl'});");
});

/*
 *  Task Entity page Download 
 *  button
 * */
$("#download_user_task").click(function(){
    $("#example").table2excel({
    exclude: ".noExl",
    name: "TaskEntity",
    filename: "task_entity"
    });
});


$('#download_task_status').click(function(){
    $("#tbl_task").table2excel({
	exclude: ".noExl",
	name: "TaskReports",
	filename: "task_reports.xls"
    });
});

function add_task_note(note, note_category, object_id, note_for, attach_files){
    var page = $('#task_menu1').find('li.active').first('a span').text()
    $.ajax({
	type: "POST",
	url: "/callajax/",
	data: {"object_name": "Create Note", "note_text": note, "note_category": note_category, "task_id": object_id, "note_for": note_for, "attach_files": attach_files, "page": page},
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

function object_status_change(project, object_id, status_for, new_status){
    var page = $('#task_menu1').find('li.active').first('a span').text().trim();
    $.ajax({
	type: "POST",
	url: "/callajax/",
	data: {"object_name": "Change Status", "new_status": new_status, "object_id": object_id, "status_for": status_for, 'page': page, 'project': project},
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

    if (my_status != 'Pending Internal Review' && version == 'None'){
	alert("You are tring to approve invalid version !!!");
	return null;
    }

    var task_name = $td_status.attr('title');

    object_id = $tr.attr('data-task-id');
    version_id = $tr.attr('data-version-id');
    object_type = $tr.attr('data-object-type');
    project = $tr.attr('data-project');

    $('#data-modal-object-id').attr("data-modal-project", project);

    change_status = '';
    change_status_label = '';
    note_category = 'Internal';

    task_array = ['Animation','Blocking'];

    if (my_status == 'Pending Client Review'){
	change_status = 'Client Approved';
	change_status_label = 'client_approved';
	note_category = 'Client feedback';
	if (task_array.indexOf(task_name) > -1){
	    change_status = 'Final Publish';
	    change_status_label = 'final_publish';
	}
    }else if (my_status == 'Pending Internal Review'){
        /* 
         If task is Lighting then change status
         to Internal Approved else ready to publish
        */
	if(task_name == "Lighting"){
            change_status = 'Internal Approved'
            change_status_label = 'internal_approved';
        }
        else{
            change_status = 'Ready to Publish';
            change_status_label = 'ready_to_publish';
            version_id = '';
        }
	//version_id = '';
    }else if (my_status == 'Outsource'){
	change_status = 'Outsource Approved';
	change_status_label = 'outsource_approved';
    }else if (my_status == 'Outsource Client Review'){
	change_status = 'Outsource Client Approved';
	change_status_label = 'outsource_client_approved';
	note_category = 'Client feedback';
    }

    $('#task_reject_note').val('');
    $('#gallery tbody').html('');
    $('#task_details_loader').html('<h3>Approve Note</h3><table><tr><td nowrap>Task : '+task_path+'</td><td>Version : '+version+'</td></tr></table>')
    var $newModal = $("#myModal").clone();
    $newModal.modal('show');

    $newModal.on('click', '#btn_note_reject', function(e){
        e.preventDefault();

        var note_text = $(this).parent().find('textarea[id=task_reject_note]').val().trim();
        if (!(note_text.length && object_id)){
            error_message("invalid note ...");
            return null;
        }

        var attachments = [];
        $(this).parent().find('table[id=gallery] tr td a').each(function(){
            href = $(this).attr('href');
            attachments.push(href);
        });

        attach_files = JSON.stringify(attachments);

	from_task = to_task = task_path 

        if (object_id){
            // changing status here
	    note_on = 'Task';
            object_status_change(project, object_id, note_on, change_status);
	    create_new_note(object_id, note_text, note_category, note_on, '', attach_files, from_task, to_task, change_status);

            if (version_id && version_id != 'undefined'){
		note_on = 'Version';
                object_status_change(project, version_id, note_on, change_status);
		create_new_note(version_id, note_text, note_category, note_on, '', attach_files, from_task, to_task, change_status);
            }

            $td_status.html('<span class="label label-'+change_status_label+'">'+change_status+'</span>');
            $td_status.attr('data-org-val',change_status);

            my_date = moment().format('YYYY-MM-DD HH:mm:ss');
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

    if (my_status != 'Pending Internal Review' && version == 'None'){
	alert("You are tring to reject invalid version !!!");
	return null;
    }

    object_id = $tr.attr('data-task-id');
    version_id = $tr.attr('data-version-id');
    object_type = $tr.attr('data-object-type');
    project = $tr.attr('data-project');

    $('#data-modal-object-id').attr("data-modal-project", project);

    change_status = '';
    change_status_label = '';
    note_category = 'Internal';

    if (my_status == 'Pending Client Review'){
	change_status = 'Client Reject';
	change_status_label = 'client_reject';
	note_category = 'Client feedback';
    }else if (my_status == 'Pending Internal Review'){
	change_status = 'Internal Reject';
	change_status_label = 'internal_reject';
    }else if (my_status == 'Outsource'){
	change_status = 'Outsource Reject';
	change_status_label = 'outsource_reject';
    }else if (my_status == 'Outsource Client Review'){
	change_status = 'Outsource Client Reject';
	change_status_label = 'outsource_client_reject';
	note_category = 'Client feedback';
    }

    $('#task_reject_note').val('');
    $('#gallery tbody').html('');
    $('#task_details_loader').html('<h3>Reject Note</h3><table><tr><td nowrap>Task : '+task_path+'</td><td>Version : '+version+'</td></tr></table>')
    var $newModal = $("#myModal").clone();
    $newModal.modal('show');

    $newModal.on('click', '#btn_note_reject', function(e){
	e.preventDefault();

	var note_text = $(this).parent().find('textarea[id=task_reject_note]').val().trim();
	if (!(note_text.length && object_id)){
	    error_message("invalid note ...");
	    return null;
	}

	var attachments = [];
	$(this).parent().find('table[id=gallery] tr td a').each(function(){
	    href = $(this).attr('href');
	    attachments.push(href);
	});

	attach_files = JSON.stringify(attachments);

	from_task = to_task = task_path
        // changing status here
	note_on = 'Task';
        object_status_change(project, object_id, note_on, change_status);
	create_new_note(object_id, note_text, note_category, note_on, '', attach_files, from_task, to_task, change_status);

        if (version_id && version_id != 'undefined'){
	    note_on = 'Version';
            object_status_change(project, version_id, note_on, change_status);
	    create_new_note(version_id, note_text, note_category, note_on, '', attach_files, from_task, to_task, change_status);
        }

	$td_status.html('<span class="label label-'+change_status_label+'">'+change_status+'</span>');
	$td_status.attr('data-org-val',change_status);

	my_date = moment().format('YYYY-MM-DD HH:mm:ss');
	$td_date.html('<strong>'+my_date+'</strong>');

	$(param).css({'display':'none'});
	$(param).parent().find('[id=task_approved]').css({'display':'none'});

	$newModal.modal('hide');
    });

}
// Function for internal rejection

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

    months = []
    for ( i=0 ; i<duration; i++){
	month = moment().subtract(i, 'month').format('MMM-YYYY');
	months.push(month)
    }
    thead = '<thead style="transform: translate(0px, 0px);"><tr><th rowspan="2"><h4></h4></th><th colspan="2"></th>';
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
    $("#tbl_shot_build").html(thead + tbody);
    return months

}

$('#tab_asset_reports_month_wise').click(function(){
    $('#download_task_report_month_wise').attr("onclick",
    "$('#tbl_asset_build').table2excel({filename: 'month_wise_reports',exclude: '.noExl'});");
});

$('#tab_shot_reports_month_wise').click(function(){
    $('#download_task_report_month_wise').attr("onclick",
    "$('#tbl_shot_build').table2excel({filename: 'month_wise_asset_build',exclude: '.noExl'});");
});


function month_wise_reports(){

    project_id = $('#selectMonthProject').val();
    if(!project_id){
	error_message("Please select valid project !!!");
    }

    project = $("#selectMonthProject option[value='"+project_id+"']").text();


    duration = $("#selectMonthDuration").val();

    asset_months = create_table_row(duration);

    shot_months = create_table_row(duration);

    json_months = JSON.stringify(months)

    start = moment().subtract(duration-1, 'months').startOf('month').format('YYYY-MM-DD');
    end = moment().endOf('month').format('YYYY-MM-DD');

    parent_object_type = 'Asset Build'

    $.ajax({
	type: "POST",
	url: "/callajax/",
	data : {'object_name': 'Month Wise Reports', 'project': project, 'start_date': start, 'end_date': end, 'parent_object_type': parent_object_type, 'months': json_months},
	beforeSend: function(){
            $('#panel_big').plainOverlay('show');
        },
	success: function(json){
	    $.each(json,function(idx,obj){

		if(obj.asset_build){
		    var asset_build_data = obj.asset_build;
		    asset_build_monthly_reports(asset_build_data, months, 'Asset Build');
		}
		if(obj.shot){
		    var shot_build_data = obj.shot;
		    asset_build_monthly_reports(shot_build_data, months, 'Shot');
		    return false;
		}
	    });
            $('#panel_big').plainOverlay('hide');
	},
	error: function(error){
	    console.log("Error:"+error);
	}

    });
}

function asset_build_monthly_reports(data, months, tab){

    table = 'tbl_asset_build';
    type_array = ['Character','Prop','Set','Total'];
    rowspan = '4';
    if(tab == 'Shot'){
	type_array = ['Layout','Animation','Lighting', 'Total'];
	table = 'tbl_shot_build';
	rowspan = '4';
    }
    font_color = '"color: #00FFDB;"';
    status_array = ['Total','WIP','Internal','Review','Approved'];
    month_color = {
		    'Jan':'"background-color: #2b2c2d;"',
		    'Feb':'"background-color: #333333;"',
		    'Mar':'"background-color: #2b2c2d;"',
		    'Apr':'"background-color: #333333;"',
		    'May':'"background-color: #2b2c2d;"',
		    'Jun':'"background-color: #333333;"',
		    'Jul':'"background-color: #2b2c2d;"',
		    'Aug':'"background-color: #333333;"',
		    'Sep':'"background-color: #2b2c2d;"',
		    'Oct':'"background-color: #333333;"',
		    'Nov':'"background-color: #2b2c2d;"',
		    'Dec':'"background-color: #333333;"',
		    };

    $.each(data, function(task,task_data){

	task_row = '<td style="background-color: #2b2c2d;" rowspan="'+rowspan+'"><h3>'+task+'</h3></td>';
	$.each(type_array, function( index, value ) { // ['Character','Prop','Set','Total']
	    if (value == 'Total'){
		task_row = task_row + '<td style="background-color: #333333;">'+task_data[value]+'</td><td style="background-color: #333333;">'+task_data['Percent']+'%</td>';
	    }else{
		if (task_data && task_data[value]){
		    task_row = task_row + '<td style="background-color: #2b2c2d;" nowrap>'+value+'</td><td style="background-color: #2b2c2d;">'+task_data[value]['Percent']+'%</td>';
		}else{
		    task_row = task_row + '<td style="background-color: #2b2c2d;" nowrap>'+value+'</td><td style="background-color: #2b2c2d;">0%</td>';
		}
	    }
	    $.each($("#tbl_asset_build tr:eq(0) th"), function(idx) {
		if (idx <= 1)
		    return;

		head = $(this).text(); // Jun-2018 (month)
		month_name = head.split('-')[0];
		bg_color = month_color[month_name];
		$.each(status_array, function( index, stat_value ) { // ['Total','WIP','Internal','Review','Approved']

		    var tasks = '';
		    var count = 0;
		    var on_click = '';

		    if (value == 'Total'){
			if (task_data[head] && task_data[head][stat_value]){
			    tasks = task_data[head][stat_value]["Task"];
			    count = task_data[head][stat_value]['Count'];
			    font_color = '"color: #00FF00;"';
			}
		    }else{
			if (task_data[value] && task_data[value][head]){
			    tasks = task_data[value][head][stat_value]["Task"];
			    count = task_data[value][head][stat_value]['Count'];
			    font_color = '"color: #00FFDB;"';
			}
		    }

		    if (count != 0){
			on_click = 'onclick=\"show_month_dialog(\''+task+'\',\''+head+'\',\''+tasks+'\')\"';
		    }else{
			count = '---';
		    }

		    task_row = task_row + '<td style='+bg_color+' '+on_click+'><strong style='+font_color+'>'+count+'</strong></td>';

		});
	    });

	    if(task == 'Gross'){
		task_row = task_row.replace(/td/g,'th');
		$("#"+table+" thead").append('<tr>'+task_row+'</tr>');
	    }else{
		$("#"+table).append('<tr>'+task_row+'</tr>');
	    }

	    task_row = '';
	});
    });
}
function show_month_dialog(task,month,tasks){

    all_tasks = tasks.replace(/,/g,'<br>')
    $('#show_monthly_task').html('');
    $('#show_monthly_task').append('<p>Task Name : <strong style="color: #00ff1e;">'+task+'<strong></p>');
    $('#show_monthly_task').append('<p>Month : <strong style="color: #00ff1e;">'+month+'<strong></p>');
    $('#show_monthly_task').append('<ul class="list-group" style="overflow: auto;height: 300px;"><strong>Tasks : <strong></p>'+
    '<li class="list-group-item" style="border: 1px solid rgba(255,255,255,255);"><p>'+all_tasks+'</p>');
    $("#myModal").modal('show');
}
function mgm_dashboard(){

    project = $('#selectMGMDashProject').val();
    if(!project){
	error_message("Please select valid project !!!");
    }

    $.ajax({
	type: "POST",
	url: "/callajax/",
	data : {'object_name': 'MGM Dashboard', 'project': project },
	beforeSend: function(){

	    remove_rows('#tbl_sequence');
	    remove_rows('#tbl_asset_build');
	    remove_rows('#tbl_outsource_sequence');
	    remove_rows('#tbl_outsource_asset_build');
        to_clear_checkboxes();
        },
        complete: function(){
        },
	success: function(json){
	    $.each(json,function(idx,obj){

		/*var users_data = obj.user_count;
		show_total_users(users_data);*/

		var sequence_data = obj.sequence;
		create_sequence_table(sequence_data, '#tbl_sequence');

		var asset_build_data = obj.asset_build;
		create_asset_build_table(asset_build_data, '#tbl_asset_build');

		var outsource_seq_data = obj.outsource_seq;
		create_sequence_table(outsource_seq_data, '#tbl_outsource_sequence');

		var outsource_asset_data = obj.outsource_asset;
		create_asset_build_table(outsource_asset_data, '#tbl_outsource_asset_build');
	    });
	},
	error: function(error){
	    console.log("Error:"+error);
	}

    });
}

/*
    before call to ajax forcefully check
    all the check boxes.
*/
function to_clear_checkboxes(){

    $("#shot_type_checkboxes input:checkbox").each(function(){
        $(this).prop("checked", true);
        $("#select_all").prop("checked", true);
        var colHead = "table ." + $(this).attr("name").trim();
        $(colHead).show();
    });
    $("#asset_type_checkboxes input").each(function(){
        $(this).prop("checked", true);
        $("#asset_select_all").prop("checked", true);
        var colHead = "table ." + $(this).attr("name");
        $(colHead).show();
    });
}
/*function show_total_users(data) {
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
}*/
/*
 * Generating html table's tr and td in string
 * format then returing it.
 *
 * params:- tasks:- accept a dict with key as task_name
 *                  and value as the assigned user/users
*/
function create_table_internal_outsource_users(tasks){

    var table_val = '';
    $.each(tasks, function(idx, task_users_dict){
        $.each(task_users_dict, function(task_name, users){
            tr = '<tr><td>' + task_name + '</td>';
            tr += '<td>' + users + '</td></tr>'
            table_val += tr;
        });
    });
    return table_val;
}
function create_sequence_table(data, tabl_nm){

    $.each(data, function(seq,task_status){
	wip_data = '<td rowspan="3"><h3>'+seq+'</h3></td><td rowspan="3"><h5>'+task_status.total_shots+'</h5></td><td>WIP</td>';
	done_data = '<td>DONE</td>';
	approved_data = '<td>APPROVED</td>';

	$.each($(tabl_nm + " th"), function(idx) {
	    if (idx <= 2)
		return;

	    head = $(this).text();
	    head_value = head.split(' ').join('_');
	    if (task_status.WIP[head].Count == 0){
		wip_data = wip_data + '<td class="'+head_value+'">'+
		task_status.WIP[head].Count+'</td>';
	    }else{
		table_schema = create_table_internal_outsource_users(task_status.WIP[head].Task);
		wip_data = wip_data + '<td class="'+head_value+'"'+
		'onclick="show_inter_outsou_tasks(\''+tabl_nm+'\',\''+table_schema+'\')">'+
		'<strong style="color: #00ff1e;">'+
		task_status.WIP[head].Count+'</strong></td>';
	    }
	    if (task_status.DONE[head].Count == 0){
		done_data = done_data + '<td class="'+head_value+'">'+
		task_status.DONE[head].Count+'</td>';
	    }else{
		table_schema = create_table_internal_outsource_users(task_status.DONE[head].Task);
		done_data = done_data + '<td class="'+head_value+'"'+
		'onclick="show_inter_outsou_tasks(\''+tabl_nm+'\','+
		'\''+table_schema+'\')">'+
		'<strong style="color: #00ff1e;">'+
		task_status.DONE[head].Count+'</strong></td>';
	    }
	    if (task_status.APPROVED[head].Count == 0){
		approved_data = approved_data + '<td class="'+head_value+'">'+
		task_status.APPROVED[head].Count+'</td>';
	    }else{
		table_schema = create_table_internal_outsource_users(task_status.APPROVED[head].Task);
		approved_data = approved_data + '<td class="'+head_value+'"'+
		'onclick="show_inter_outsou_tasks(\''+tabl_nm+'\','+
		'\''+table_schema+'\')">'+
		'<strong style="color: #00ff1e;">'+
		task_status.APPROVED[head].Count+'</strong></td>';
	    }
	});
	tr_wip = '<tr>'+wip_data+'</tr>';
	tr_done = '<tr>'+done_data+'</tr>';
	tr_approved = '<tr>'+approved_data+'</tr>';
	$(tabl_nm).append(tr_wip+tr_done+tr_approved);

    });
}
function create_asset_build_table(data, tabl_nm){

    $.each(data, function(asset_type,task_status){
	wip_data = '<td rowspan="3"><h3>'+asset_type+'</h3></td><td rowspan="3">'+
	'<h5>'+task_status.total_assets+'</h5></td><td>WIP</td>';
	done_data = '<td>DONE</td>';
	approved_data = '<td>APPROVED</td>';

	$.each($(tabl_nm + " th"), function(idx) {
	    if (idx <= 2)
		return;

	    head = $(this).text();
	    head_value = head.split(' ').join('_');
	    if (task_status.WIP[head].Count == 0){
		wip_data = wip_data + '<td class="'+head_value+'">'+
		task_status.WIP[head].Count+'</td>';
	    }else{

		table_schema = create_table_internal_outsource_users(task_status.WIP[head].Task);
		wip_data = wip_data + '<td class="'+head_value+'"'+
		'onclick="show_inter_outsou_tasks(\''+tabl_nm+'\',\''+
		table_schema+'\')">'+
		'<strong style="color: #00ff1e;">'+
		task_status.WIP[head].Count+'</strong></td>';
	    }

	    if (task_status.DONE[head].Count == 0){
		done_data = done_data + '<td class="'+head_value+'">'+
		task_status.DONE[head].Count+'</td>';
	    }else{
		table_schema = create_table_internal_outsource_users(task_status.DONE[head].Task);
		done_data = done_data + '<td class="'+head_value+'"'+
		'onclick="show_inter_outsou_tasks(\''+tabl_nm+'\',\''+
		table_schema+'\')">'+
		'<strong style="color: #00ff1e;">'+
		task_status.DONE[head].Count+'</strong></td>';
	    }
	    if (task_status.APPROVED[head].Count == 0){
		approved_data = approved_data + '<td class="'+head_value+'">'+
		task_status.APPROVED[head].Count+'</td>';
	    }else{
		table_schema = create_table_internal_outsource_users(task_status.APPROVED[head].Task);
		approved_data = approved_data + '<td class="'+head_value+'"'+
		'onclick="show_inter_outsou_tasks(\''+tabl_nm+'\',\''+
		table_schema+'\')">'+
		'<strong style="color: #00ff1e;">'+
		task_status.APPROVED[head].Count+'</strong></td>';
	    }
	});
	tr_wip = '<tr>'+wip_data+'</tr>';
	tr_done = '<tr>'+done_data+'</tr>';
	tr_approved = '<tr>'+approved_data+'</tr>';
	$(tabl_nm).append(tr_wip+tr_done+tr_approved)
    });
}

function show_inter_outsou_tasks(tbl_nm, user){
//    all_tasks = task_list.replace(/,/g, '</br>');
//    all_tasks = task_list.split(",");
//    all_users = user.split(",");
//    console.log(all_users);
    if (tbl_nm.replace("#",'').includes('outsource'))
        header = "Outsource Details"
    else
        header = "Internal Details"

    $("#asset_sequence_reports").html('');

    $("#asset_sequence_reports").append("<h5>"+header+"</h5>");

//    $("#asset_sequence_reports").append('<ul class="list-group">'+
    var s = '<table id="status_table" style="width:100%"'+
    'class="table-hover table-condensed table-bordered"><thead>'+
    '<tr><th>Task Names</th><th>Users</th></tr></thead><tbody></tbody></table>';
    $("#asset_sequence_reports").append(s);

    $("#status_table tbody").append(user);
    /*$.each(all_tasks,function(idx, val){
        tr = $("<tr>");
        tr.append('<td>'+val+'</td>');

        $("#status_table tbody").append(tr);
    });
    i = 0;
    $("#status_table tbody tr").each(function(){
        $(this).append("<td>"+all_users[i++]+"</td>");
    });*/
    //'<li class="list-group-item" style="border: 1px solid rgba(255,255,255,255);"><h5>'+all_tasks+'</h5>');
    $("#mymodal").modal('show');
}

$("#select_all").click(function(){

    $("#shot_type_checkboxes input").each(function(){
        var check = $(this).prop("checked");
        if (check == true){
            $(this).prop("checked", false);
            $("#select_all").prop("checked", false);
            var colHead = "table ." + $(this).attr("name").trim();
            $(colHead).toggle();
        }
        else{
            $(this).prop("checked", true);
            $("#select_all").prop("checked", true);
            var colHead = "table ." + $(this).attr("name").trim();
            $(colHead).toggle();
        }
    });
});

$('#shot_type_checkboxes input[type="checkbox"]').click(function(){
    var s = $(this).prop("checked");
    if (s == true && $(this).attr("id") != 'deselect_all') {
        var nm = $(this).attr("name").split(' ').join('_');
        var colHead = "table ." + nm;
        $(colHead).toggle();
    }
    else if (s == false && $(this).attr("id") != 'deselect_all') {
        nm = $(this).attr("name").split(' ').join('_');
        var colHead = "table ." + nm;
        $(colHead).toggle();
    }
});

$("#asset_select_all").click(function(){

    $("#asset_type_checkboxes input").each(function(){
        var check = $(this).prop("checked");
        if (check == true){
            $(this).prop("checked", false);
            $("#asset_select_all").prop("checked", false);
            var colHead = "table ." + $(this).attr("name");
            $(colHead).toggle();
        }
        else{
            $(this).prop("checked", true);
            $("#asset_select_all").prop("checked", true);
            var colHead = "table ." + $(this).attr("name");
            $(colHead).toggle();
        }
    });

});

$('#asset_type_checkboxes input[type="checkbox"]').click(function(){
    var s = $(this).prop("checked");
    if (s == true && $(this).attr("id") != 'asset_deselect_all') {
        var nm = $(this).attr("name").split(' ').join('_');
        var colHead = "table ." + nm;
        $(colHead).toggle();
    }
    else if (s == false && $(this).attr("id") != 'asset_deselect_all') {
        nm = $(this).attr("name").split(' ').join('_');
        var colHead = "table ." + nm;
        $(colHead).toggle();
    }
});

$('#show_prod_records').click(function(){
    artist_productivity();

});

function artist_productivity(){

    project_id = $('#selectDashProject').val();
    if(!project_id){
	error_message("Please select valid project !!!");
    }

    project = $("#selectDashProject option[value='"+project_id+"']").text();
    duration = $('#reportrange span').html();
    if(!duration){
	error_message("Please select valid duration !!!");
    }

    task_name = $("#dept_names option:selected").val();
    artist = $('#selectUsers').val();

    dur_arr = duration.split(' : ');

    first = dur_arr[0];
    last = dur_arr[1];

    $.ajax({
	type: "POST",
	url: "/callajax/",
	data : {'object_name': 'Artist Productivity', 'project': project, 'first': first, 'last': last, 'artist': artist, 'task_name':task_name},
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

function show_task_dialog(artist, table_tr){

    //all_tasks = tasks.replace(/,/g,'')
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

    project = $('#selectDashProject').val();
    if(!project){
	error_message("Please select valid project !!!");
    }

    duration = $('#reportrange span').html();
    if(!duration){
	error_message("Please select valid duration !!!");
    }

    task = $('#selectMGMTask').val();

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
	    if ($.fn.DataTable.isDataTable("#tbl_task")){
                get_table_header().clear().draw();
                get_table_header().destroy();
            }

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
	complete: function(){
//	    create_datatable('tbl_task');
	},
	error: function(error){
	    console.log("Error:"+error);
	}

    });
}

function user_task_table(data){

    $.each(data, function(idx,obj){
	row = '<tr>\
	<td title="Task"><strong>'+obj.task+'</strong></td>\
	<td title="User"><strong>'+obj.user+'</strong></td>\
	<td title="Status"><strong>'+obj.task_status+'</strong></td>\
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
	    var full_path = $(this).text();
	    task_arr = full_path.split(':');
	    last_idx = task_arr.length - 1;
	    td_name = task_arr[last_idx];
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

        $("label[data-id='project']").text(project_name);

        var obj_value = $('#selectObject option:selected').text();

        $("label[data-id='objects']").text(obj_value);

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
                var client_status = $('td', this).eq(i).attr('data-client-status');
                if(status == prev_status){
                  //user assigned to selected task
                  var assigned_user = $('td', this).eq(i + 1).text();
                  var row = $("<tr>");
                  row.append("<td>" + task +"</td>");
                  row.append("<td>" + task_name +"</td>");
                  row.append("<td>" + assigned_user +"</td>");
                  row.append("<td>" + prev_status +"</td>");
                  row.append("<td nowrap>" + client_status +"</td>");
                  $("#status_count_table").append(row);
                }else if(status == 'Total'){
                  var assigned_user = $('td', this).eq(i + 1).text();
                  var row = $("<tr>");
                  row.append("<td>" + task +"</td>");
                  row.append("<td>" + task_name +"</td>");
                  row.append("<td>" + assigned_user +"</td>");
                  row.append("<td>" + prev_status +"</td>");
                  row.append("<td nowrap>" + client_status +"</td>");
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
            error_message("invalid reason ...");
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

    currentRow = $(param).closest('tr');
    var page = $('#task_menu1').find('li.active').first('a span').text().trim();
    var parent_id = currentRow.attr('data-task-parent-id');
    var path = currentRow.find("td:eq(0)").text().trim();
    var row_index = currentRow.index();

    project = currentRow.attr('data-project');
    task_id = currentRow.attr('data-task-id');


    var clicked_button_id = $(param).attr("id");
    if(clicked_button_id == 'task_approved'){
        currentRow.find("td:eq(9)").find("#"+clicked_button_id).css("display", "none");
        currentRow.find("td:eq(9)").find("#task_reject").css("display", "inline");
    }
    if(clicked_button_id == 'task_reject'){
        currentRow.find("td:eq(9)").find("#"+clicked_button_id).css("display", "none");
        currentRow.find("td:eq(9)").find("#task_approved").css("display", "inline");
    }

    $.ajax({
	    type: "POST",
	    url: "/callajax/",
        data : {'object_name': 'Artist Action', 'project': project, 'task_id': task_id, 'action': action,
                    'note_text': note_text, 'page': page, "parent_id": parent_id, 'path': path},
        beforeSend: function(){
            },
        success: function(json){

            $.each(json, function(key, dict_value){
                currentRow.find("td:eq(1)").attr("data-org-val", dict_value.task_status);
                currentRow.find("td:eq(1)").find("span").removeClass();
                currentRow.find("td:eq(1)").find("span").text(dict_value.task_status);
                currentRow.find("td:eq(1)").find("span").addClass("label label-"+dict_value.status_label);

                currentRow.find("td:eq(2)").find('strong').text(dict_value.start_date);
                currentRow.find("td:eq(3)").find('strong').text(dict_value.finish_date);

                currentRow.find("td:eq(4)").find('span').text(dict_value.backup_status);
                currentRow.find("td:eq(4)").find("span").removeClass();
                currentRow.find("td:eq(4)").find("span").addClass("label label-" + dict_value.backup_status);

                currentRow.find("td:eq(5)").find('strong').text(dict_value.upload_date);
                currentRow.find("td:eq(6)").find('strong').text(dict_value.bid_hours);
                currentRow.find("td:eq(7)").find('strong').text(dict_value.total_hours);
                currentRow.find("td:eq(8)").find('strong').text(dict_value.time_left);
            });
            noty({
                    text: 'Your task has been '+action,
                    layout: 'topCenter',
                    closeWith: ['click', 'hover'],
                    type: 'success'
            });
        },
        complete: function(){
            console.log("ajax call completed")
        },
        error: function(error){
            console.log("Error:"+error);
        }
    });

}

function show_artist_tasks(){

    project = $('#selectArtistProject').val();
    if(!project){
	    error_message("Please select valid project !!!");
    }

    selected_status = $('#selectStatus').val();

    $.ajax({
        type: "POST",
        url: "/callajax/",
        data : {
	    'object_name': 'Artist Tasks', 'status': selected_status, 'project': project
        },
        beforeSend: function(){
		remove_rows('#tbl_task');
                $('#panel_big').plainOverlay('show');
                if ($.fn.DataTable.isDataTable("#tbl_task")){
                    get_table_header().clear().draw();
                    get_table_header().destroy();
                }
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
                <tr class="'+obj.task_pub_status+'" data-project="'+obj.project+'" data-task-id="'+obj.task_id+'" data-task-parent-id="'+obj.parent_id+'" data-parent-object-type="'+obj.parent_object_type+'">\
                      <td style="width:400px;" data-task-id="'+obj.task_id+'" data-task-assignee="'+obj.user_name+'" data-task-parent-id="'+obj.parent_id+'">\
                        <strong><a href="#" id="task_object" style="color: aqua;" \
                                   onclick="show_model(this)">'+obj.path+'</a></strong>\
                      </td>\
                      <td data-task-id="'+obj.task_id+'"\
                          data-org-val="'+obj.task_status+'">\
                        <span class="label label-'+obj.status_label+'">'+obj.task_status+'</span>\
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
                        <button title="STOP" class="btn btn-inverse btn-danger btn-sm" id="task_reject"\
                                style="color: black;'+action_stop+'" onclick="artist_action(this)">\
                          <i class="glyphicon glyphicon-stop"></i>\
                        </button>\
                      </td>\
                    </tr>';
                /*
                    <td>\
                        <strong>'+obj.project+'</strong>\
                      </td>\
                      <td>\
                        <strong>'+obj.task+'</strong>\
                      </td>\

                    <button title="PAUSE" class="btn btn-inverse btn-warning btn-sm" id="task_pause"\
                                style="color: black;'+action_pause+'" onclick="artist_action(this)">\
                          <i class="glyphicon glyphicon-pause"></i>\
                        </button>\
                        <button title="REVIEW" class="btn btn-inverse btn-primary btn-sm" id="task_review"\
                                style="color: black;'+action_review+'" onclick="artist_action(this)">\
                          <i class="glyphicon glyphicon-send"></i>\
                        </button>\
                */
                $('#tbl_task tbody').append(table_row);
            });
            $('#panel_big').plainOverlay('hide');
	},
	complete: function(){
	    create_datatable('tbl_task');
	},
	error: function(error){
	    console.log("Error:"+error);
	}

    });
}

$('#select_all_pages').change(function(){
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

function toggle_tr_check(param){

    checked = $(param).prop('checked');
    $(param).closest('tr').find("td input[type='checkbox']").each(function(){
	$(this).prop('checked', checked);
    });

}

function update_role_pages(action){
    role = '';
    if(action == 'create'){
	role = $('#user_role').val().trim();
	exists = '';
	$("#selectRole option").each(function(){
	    if($(this).text().toLowerCase() == role.toLowerCase())
		exists = 'true';
	});
	if(exists){
	    alert("Role already exists : "+role);
	    $('#user_role').val('');
	    return null;
	}

    }else{
	role = $("#selectRole").val();
    }
    page_array = [];
    $("#tbl_pages tbody tr").each(function(){
	if($(this).find("td:eq(0) input").is(":checked")){
	    page_dict = {};
            page_dict['id'] = $(this).find("td:eq(0) input").attr("id");
            page_dict['name'] = $(this).find("td:eq(1)").text().trim();
            page_dict['url'] = $(this).find("td:eq(0) input").attr("data-url");

	    access = [];
            for(i=2;i<=5;i++){
                if($(this).find("td:eq('"+i+"') input").is(":checked"))
                    access.push($(this).find("td:eq('"+i+"') input").attr('name'));
            }
            page_dict['access'] = access;
            page_array.push(page_dict);
        }
    });

    var page_details = JSON.stringify(page_array);
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data:{
            'object_name': 'Update Role Page', 'page_details': page_details, "role": role
        },
        success: function(json){
                noty({
                    text: 'Role ('+role+') '+action+' successfully',
                    layout: 'topCenter',
                    closeWith: ['click', 'hover'],
                    type: 'success'
                });
		if (action == 'create'){
		    $('#selectRole').append('<option value="'+role+'" selected>'+role+'</option>');
		    $('#selectRole').trigger("liszt:updated").trigger("chosen:updated");
		}
        },
	error: function(error){
	    console.log("Error:"+error);
	}
    });

}

$('#selectRole').change(function(){
    show_role_pages();
});
function show_role_pages(){

    role = $('#selectRole').val();
    if(!role){
	error_message("Please select valid role !!!");
    }

    $.ajax({
        type: "POST",
        url: "/callajax/",
        data : {
	    'object_name': 'Role Pages', 'role': role
        },
        beforeSend: function(){
		remove_rows('#tbl_pages');
                $('#panel_big').plainOverlay('show');
                if ($.fn.DataTable.isDataTable("#tbl_pages")){
                    get_table_header().clear().draw();
                    get_table_header().destroy();
                }
            },
        success: function(json){

            $.each(json,function(idx,obj){
		url = obj.url;
		id = obj.id;
		name = obj.name;
		access = obj.access;
		active = 'checked';
		if (obj.active == 'inactive'){
		    active = '';
		}
		    
		var add = '';
		var update = '';
		var del = '';
		$.each(access, function(idx,acc){
		    if (acc == 'Add'){
			add = 'checked';
		    }else if (acc == 'Update'){
			update = 'checked';
		    }else if (acc == 'Delete'){
			del = 'checked';
		    }
		});

                table_row = '\
		    <tr><td><input id="'+id+'" data-url="'+url+'" type="checkbox" '+active+' onclick="toggle_tr_check(this)"></td>\
		    <td><strong>'+name+'</strong></td>\
		    <td><input name="Add" id="add_'+id+'" type="checkbox" '+add+'></td>\
		    <td><input name="Update" id="update_'+id+'" type="checkbox" '+update+'></td>\
		    <td><input name="Delete" id="delete_'+id+'" type="checkbox" '+del+'></td></tr>\
		';
                $('#tbl_pages tbody').append(table_row);
            });
            $('#panel_big').plainOverlay('hide');
	},
	complete: function(){
	    create_datatable('tbl_pages');
	},
	error: function(error){
	    console.log("Error:"+error);
	}

    });
}

function editRoleCell(context, select_div){

    var OriginalContent = $(context).text();
    OriginalContent = OriginalContent.split(',');

    var clone = $('#'+select_div).clone(true);
    $clonedChosen = clone.find('select').clone().off()

    $parentTd = $(context).closest('td');
    $parentTd.empty().append($($clonedChosen).show("show"));

    $select = $parentTd.find('select')
    $select.chosen({width: "200px"})

    $select.val(OriginalContent).trigger("liszt:updated");
    $select.trigger("chosen:updated");

    $select.trigger('chosen:open');
    $select.on('chosen:hiding_dropdown', function () {
        tasks = $select.val();
	task_text = '---';
	
	if (tasks && $.isArray(tasks)){
	    task_text = tasks.join();
	}else if(tasks){
	    task_text = tasks;
	}
        $(context).html('<label class="label label-default" id="label_'+select_div+'">'+task_text+'</label>');
    });

}
function edit_users(param){
    $tr = $(param).closest('tr');
    full_name = $tr.find('td[name=full_name]').text();
    user_name = $tr.find('td[name=user_name]').text().trim();
    dept = $tr.find('td[name=department]').text();
    role = $tr.find('td[name=role]').text();
    columns = $(param).attr('data-active_columns');

    if (!columns){
	columns = '---';
    }

    table_data = '<table>\
		    <tr><td><strong>Full Name :</strong></td><td><strong>'+full_name+'</strong></td></tr>\
		    <tr><td><strong>User Name :</strong></td><td><strong>'+user_name+'</strong></td></tr>\
		    <tr><td><strong>Department :</strong></td><td><strong>'+dept+'</strong></td></tr>\
		    <tr><td><strong>Role :</strong></td><td><strong>'+role+'</strong></td></tr>\
		    <tr><td><strong>Change Role :</strong></td>\
			<td ondblclick="editRoleCell(this,\'user_roles\')"><label class="label label-default" id="label_user_roles">'+role+'</label></td></tr>\
		    <tr><td><strong>Tasks :</strong></td>\
			<td ondblclick="editRoleCell(this, \'user_tasks\')"><label class="label label-default" id="label_user_tasks">'+columns+'</label></td></tr>\
		    <tr><td colspan=2><a href="#" class="btn btn-primary btn-sm" id="update_user_roles">Save changes</a>\
              <a href="#" class="btn btn-danger btn-sm" data-dismiss="modal">Close</a></td></tr>\
		</table>';

    $('#user_details_loader').html(table_data)
    var $newModal = $("#myModal").clone();
    $newModal.modal('show');

    $newModal.on('click', '#update_user_roles', function(e){
	e.preventDefault();

	columns = $(this).closest('table').find('label[id="label_user_tasks"]').text().trim();
	role = $(this).closest('table').find('label[id="label_user_roles"]').text().trim();

    $.ajax({
	type: "POST",
	url: "/callajax/",
	data : {'object_name': 'Update Users Role', 'user_name': user_name, 'role': role, 'columns': columns},
	beforeSend: function(){
        },
	success: function(json){
            noty({
                text: 'User ('+user_name+') updated successfully ...',
                layout: 'topCenter',
                closeWith: ['click', 'hover'],
                type: 'success'
            });
	},
	error: function(error){
	    console.log("Error:"+error);
	}

    });

	$newModal.modal('hide');
    });

}
/*
      JS code for click on
          Email list, To List and CC List
*/         

$("#selectEmailProject").change(function(){
    get_assigned_emails();
});

$("#selectTool").change(function(){
    get_assigned_emails();
});

$("#selectEmailTask").change(function(){
    get_assigned_emails();
});

function get_assigned_emails(){

    project_name = $("#selectEmailProject").val();
    tool_name = $("#selectTool").val();
    task_name = $("#selectEmailTask").val();

    if (!project_name || !tool_name || !task_name){
	return null;
    }

    $.ajax({
        type: "POST",
        url: "/callajax/",
        data: {
            "object_name": "Assigned Emails", "project": project_name,
            "tool_name": tool_name, "task_name": task_name
        },
        beforeSend: function(){
             $('#panel_big').plainOverlay('show');
             $("#cc_list").empty();
             $("#to_list").empty();
             $(".div_emails ul").empty();
        },
        success: function(json){
            if(jQuery.isEmptyObject(json))
                error_message("No records to show");
            else{
                display_to_cc_unique_email_ids(json);
            }
            $('#panel_big').plainOverlay('hide');
        }
    });

}

function display_to_cc_unique_email_ids(json){

    to = json.to;
    cc = json.cc;
    unique_emails_data = json.unique_list;
    if(to){
        $.each(to, function(idx, value){
            li = $("<li class='list-group-item' data-value='"+value+"' data-type='"+value.role+"'>"
            +value.email+"</li>");
            $("#to_list").append(li);
        });
    }
    if(cc){
        $.each(cc, function(idx, value){
            li = $(
            "<li class='list-group-item' data-value='"+value+"' data-type='"+value.role+"'>"
            +value.email+"</li>");
            $("#cc_list").append(li);
        });
    }
    if(unique_emails_data){
        $.each(unique_emails_data, function(role, value){
            $.each(value, function(idx, email){
                li_data = $("<li class='list-group-item' data-type='"+role+"'>"+email+"</li>");
                $("#"+role+"_ul").append(li_data);
            });
        });
    }
}

function store_email_tool_wise(param){

    project_name = $("#selectEmailProject").val();
    tool_name = $("#selectTool").val();
    task_name = $("#selectEmailTask").val();

    if (!project_name || !tool_name || !task_name){
	error_message("Fields must not be empty");
	return null;
    }

    email_array = {};
    to_array = [];
    cc_array = [];

    $("#to_list li").each(function(){
        to_array.push($(this).text().trim());
    });

    $("#cc_list li").each(function(){
        cc_array.push($(this).text().trim());
    });

    email_array["to"] = to_array;
    email_array["cc"] = cc_array;
    email_array = JSON.stringify(email_array);
    if(to_array.length == 0  && cc_array.length == 0){
        error_message("Email field must not be empty");
        return null;
    }
    $.ajax({
        type: "POST",
        url: "/callajax/",
        data: {
            "object_name": "Add Emails", "project": project_name,
            "tool_name": tool_name, "task_name": task_name,
            "email_list": email_array
        },
        beforeSend: function(){
             $('#panel_big').plainOverlay('show');
        },
        success: function(json){
            noty({
                text: 'Your changes were saved ...',
                layout: 'topCenter',
                closeWith: ['click', 'hover'],
                type: 'success'
            });

            $('#panel_big').plainOverlay('hide');
        }
    });
}


$('body').on('click', '.list-group .list-group-item', function () {
    $(this).toggleClass('active');
});

$('.list-arrows button').click(function () {
    var $button = $(this), actives = '';
    var index = '';
    var selected_checkbox = get_selected_checkbox();
    if ($button.hasClass('cc')) {
        actives = $('.list-left ul li.active');
        actives.removeClass("active");
        actives.clone().appendTo('#cc_list');
        actives.remove();
    } else if ($button.hasClass('to')) {
        actives = $('.list-left ul li.active');
        actives.removeClass("active");
        actives.clone().appendTo("#to_list"); 
        actives.remove();
    }
    else if ($button.hasClass('mail_list')) {
        to = $("#to_list li.active");
        cc = $("#cc_list li.active");

        if(to.length){
            $("#to_list li").each(function(){
                var active_class = $(this).hasClass("active");
                if(active_class){
                    remove_mails_from_to_cc_list(this);
                }
            });
        }
        if (cc.length){
            $("#cc_list li").each(function(){
                var active_class = $(this).hasClass("active");
                if(active_class){
                    remove_mails_from_to_cc_list(this);
                }
            });
        }
    }
    if(selected_checkbox){
        selected_checkbox.removeClass("selected");
        selected_checkbox.children('i').removeClass('glyphicon-check').addClass('glyphicon-unchecked');
    }
    if($('.dual-list .selector').hasClass("selected"))
        $('.dual-list .selector').removeClass("selected");
});


$('[name="SearchDualList"]').keyup(function (e) {
    var code = e.keyCode || e.which;
    if (code == '9') return;
    if (code == '27') $(this).val(null);
    var $rows = $(this).closest('.dual-list').find('.list-group li');
    var val = $.trim($(this).val()).replace(/ +/g, ' ').toLowerCase();
    $rows.show().filter(function () {
        var text = $(this).text().replace(/\s+/g, ' ').toLowerCase();
        return !~text.indexOf(val);
    }).hide();
});

function remove_mails_from_to_cc_list(param){
    index = $(param).index();
    var type = $(param).attr("data-type");
    $(param).removeClass("active");
        if($("#" + type + "_ul li").length == 0)
            $(param).clone().appendTo($("#" + type + "_ul"));
        else
            $("#" + type + "_ul li:eq('"+index+"')").before($(param).clone());
    $(param).remove();
}

var checkbox_value='';
function set_selected_checkbox($checkbox){
    checkbox_value = $checkbox;
}
function get_selected_checkbox(){
    return checkbox_value;
}

function select_all(this_param){
    var role_array = ['Co-ordinator', 'Supervisor', 'Lead', 'Developer'];
    var $checkBox = $(this_param);
    var id_val = $(this_param).attr("id");
    set_selected_checkbox($checkBox);
    if(typeof id_val == "undefined"){
        if (!$checkBox.hasClass('selected')) {
            $checkBox.addClass('selected').closest('.well').find('ul li:not(.active)').addClass('active');
            $checkBox.children('i').removeClass('glyphicon-unchecked').addClass('glyphicon-check');
            for(i = 0; i < role_array.length; i++){
                var btn_id = "#" + role_array[i] +"_btn";
                $(btn_id).removeClass("selected");
                $(btn_id).children('i').removeClass('glyphicon-check').addClass('glyphicon-unchecked');
            }
        } else {
            $checkBox.removeClass('selected').closest('.well').find('ul li.active').removeClass('active');
            $checkBox.children('i').removeClass('glyphicon-check').addClass('glyphicon-unchecked');
        }
    }
    else{
        var div_id = "#" + id_val.split("_")[0];
        if(!$checkBox.hasClass("selected")){
            $(this_param).addClass('selected');
            $(div_id).find("ul li:not(.active)").addClass("active");
            $("#"+id_val).children('i').removeClass("glyphicon-unchecked").addClass('glyphicon-check');
        }
        else{
            $checkBox.removeClass('selected');
            $(div_id).find("ul li.active").removeClass("active");
            $("#"+id_val).children('i').removeClass("glyphicon-check").addClass('glyphicon-unchecked');
        }
    }

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
	    error_message("Please select valid project !!!");
    }

    review_status = $('#selectReviewStatus').val();

    $.ajax({
	type: "POST",
	url: "/callajax/",
	data : {'object_name': 'Review Tasks', 'project': project, 'status': review_status},
	beforeSend: function(){
	    remove_rows('#tbl_task');
	    $('#panel_big').plainOverlay('show');
                if ($.fn.DataTable.isDataTable("#tbl_task")){
                    get_table_header().clear().draw();
                    get_table_header().destroy();
                }
        },
	success: function(json){
	    $.each(json,function(idx,obj){
	        table_row = '\
	    <tr data-task-id="'+obj.task_id+'" data-version-id="'+obj.version_id+'" data-object-type="'+obj.object_type+'" data-project="'+obj.project+'">\
                  <td style="width:300px;" data-task-id="'+obj.task_id+'" data-td="task_path"><strong>'+obj.path+'</strong></td>\
                  <td data-td="version"><strong>'+obj.version+'</strong></td>\
                  <td data-td="users"><strong>'+obj.published_by+'</strong></td>\
                  <td title="'+obj.task+'" data-task-id="'+obj.task_id+'" data-org-val="'+obj.status+'" data-td="status">\
                    <span class="label label-'+obj.status_label+'">'+obj.status+'</span>\
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
            $("#tbl_task tbody tr").css("background-color","transparent");
	    });
	    /*
	    <td><strong>'+obj.project+'</strong></td>\
        <td><strong>'+obj.task+'</strong></td>\<td data-td="users"><strong>'+obj.users+'</strong></td>\
	    */
	    $('#panel_big').plainOverlay('hide');
	},
	complete: function(){
	    create_datatable('tbl_task');
	},
	error: function(error){
	    console.log("Error:"+error);
	}

    });
}

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
    // for check duplicate name
    var exist = "false"
    $("#selectAssetName option").each(function()
    {
      if($(this).text() == data.asset_name){
         exist = "true"
      }
    });
    //
    tr = '';
    invalid_data = 'data-invalid="0"';
    if (data.invalid == 1 || exist == "true"){
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
    $("#csv_asset_builds tbody").empty();
    $("#attached_csv_file").empty();

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
        }
        if (digit_pattern.test(nm)){
            error_message("Only digits are not allowed");
            $('#id_project_code').val('');
            $('#id_project_name').val('');
        }
        if(len > 0 && len <= max){
            $('#id_project_code').val($this.val().toLowerCase());
        }
        else{
            $('#id_project_code').prop("disabled", true);
        }
    }, 0);
    $("#id_project_folder").val('/ASE/01prj/' + nm.toUpperCase());
});
var res_pattern = /^[0-9X0-9]+$/;
$("#id_resolution").focusout(function(){
    var inp = $("#id_resolution").val();
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
    var page = $('#task_menu1').find('li.active').first('a span').text().trim();
    data_array['page'] = page;
    data_array['start_date'] = start_date;
    data_array['end_date'] = end_date;
    data_array['start_frame'] = start_frame;
    data_array['resolution'] = resolution;
    data_array['action'] = 'add';

    var data_list = [];
    data_list.push(data_array);

    var entity_name = 'Project'

    update_form_data('None', entity_name, data_list, 'Project');
    $('#table_view').empty();
    window.setTimeout(function(){
        get_project_details();
    }, 3000);
    hide_project_modal();
});// end of create project details function

function update_form_data(project_name, entity_name, data_list, object){
    object_name = 'Update Form Data';
    data_list = JSON.stringify(data_list);
    $('#entity_loader').show();
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: {
	    'object_name': object_name,
	    'data_list': data_list,
	    'project': project_name,
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
                if(object == 'Shot'){
                    $('#selectSequenceRange').val("");
                    $('#selectSequenceRange').trigger("chosen:updated");
                    $('#selectSequenceRange').trigger("liszt:updated");
                    //$('#selectSequenceRange option[value=""]').attr("selected",true);
                    $('#selectShotRange').empty()
                    $('#selectShotRange').trigger("chosen:updated");
                    $('#selectShotRange').trigger("liszt:updated");

                    $('#selectEndShotRange').empty()
                    $('#selectEndShotRange').trigger("chosen:updated");
                    $('#selectEndShotRange').trigger("liszt:updated");

                    //selectEntitySequence, selectEntityShot, all_entity_shots
                    $('#selectEntitySequence').val();

                    $('#selectEntityShot').empty()
                    $('#selectEntityShot').trigger("chosen:updated");
                    $('#selectEntityShot').trigger("liszt:updated");

                    $('#all_entity_shots').attr('checked',false);
                    $('#selectEntitySequence').val("");
                    $('#selectEntitySequence').trigger("chosen:updated");
                    $('#selectEntitySequence').trigger("liszt:updated");

                    $('#example tfoot').empty()

                    $select_elem03 = $('#selectShotType');
                    $select_elem03.empty();
                    $select_elem03.trigger("chosen:updated");
                    $('#shot_type').hide()

                }
                if(object == 'Sequence'){
                    $('#selectSequenceRange').val("");
                    $('#selectSequenceRange').trigger("chosen:updated");
                    $('#selectSequenceRange').trigger("liszt:updated");
                    //$('#selectSequenceRange option[value=""]').attr("selected",true);
                    $('#selectShotRange').val("");
                    $('#selectShotRange').trigger("chosen:updated");
                    $('#selectShotRange').trigger("liszt:updated");

                    $('#selectEndShotRange').empty()
                    $('#selectEndShotRange').trigger("chosen:updated");
                    $('#selectEndShotRange').trigger("liszt:updated");
                    //selectEntitySequence, selectEntityShot, all_entity_shots
                    $('#selectEntitySequence').val();

                    /*$('#selectEntityShot').empty()
                    $('#selectEntityShot').trigger("chosen:updated");
                    $('#selectEntityShot').trigger("liszt:updated");*/

                    $('#all_entity_sequence').attr('checked',false);
                    $('#select_all').attr('checked',false);
                    $('#example tfoot').empty()

                    $select_elem03 = $('#selectShotType');
                    $select_elem03.empty();
                    $select_elem03.trigger("chosen:updated");
                    $('#shot_type').hide()
                    $("#selectEntityObject").trigger("change");
                }
                if(object == 'AssetBuild'){
                 $('#all_assetsName').attr('checked',false);
                    var selected_assets = $('#selectAssetName').val();
                    load_asset_task_name(selected_assets)
                }
                $('#entity_loader').hide();
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
	error_message("Invalid project to update ...");
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
    var page = $('#task_menu1').find('li.active').first('a span').text().trim();
    data_array['page'] = page;
    data_array['project_id'] = project_id;
    data_array['start_date'] = start_date;
    data_array['end_date'] = end_date;
    data_array['resolution'] = resolution;
    data_array['start_frame'] = start_frame;
    data_array['project_code'] = project_code;
    data_array['fps'] = fps;
    data_array['action'] = 'update';

    var data_list = [];
    data_list.push(data_array);

    var entity_name = 'Project';

    update_form_data('None', entity_name, data_list, 'Project');
    $('#table_view').empty();

    hide_project_modal();
    window.setTimeout(function(){
        get_project_details();
    }, 3000);
});


$("#id_sequence_name").keyup(function(){

     var prj_name = $("#id_sequence_parent_object_type").val().trim();
     var sequence_name = $('#id_sequence_name').val().trim();
     flg = 0;
     if (!pattern_name.test(sequence_name)){
        error_message("Must be Alphanumeric Only");
        $("#sequenceModal").modal("hide");
        flg = 1;
     }
     if (sequence_name == ''){
        error_message("Sequence Name must not be empty")
        $("#sequenceModal").modal("hide");
        flg = 1;
     }

    var prj_name = $("#id_sequence_parent_object_type").val().trim();
    // call
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
        error_message("Sequence must contain alphabets or numbers!!!");
        return false;
    }
    if(sequence_name == ""){
        error_message("Sequence name cannot be empty!!!");
        return false;
    }
    if (status == 'Select Status'){
        error_message("Please select proper status!!!");
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
});// end of create sequence function

$('#id_frame_end').change(function(){

    var sf = $('#id_frame_start').val();
    var ef = $('#id_frame_end').val();
    var linked_to = $('#id_parent_object_type').val();
    var prj_name = get_project_name();
    var seq_name = get_sequence_name();

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
        error_message("Shot name must be alphanumeric!!!!");
        return false;
    }
    if(name == ''){
        error_message("Shot name must not be empty!!!!!");
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
    if(frame_start == ''){
        error_message("Start frame cannot be empty!!!!");
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

});// end of create asset function

var pattern = /^[0-9a-zA-Z]+$/;
var digit_pattern = /^[0-9]+$/;
/*if(asset_name == ""){
    error_message("Asset name must not be empty");
    return false;
}*/
$('#id_asset_name').focusout(function(){
    asset_name = $('#id_asset_name').val().trim();
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
        "project": get_project_name()
        },
        beforeSend: function(){
            $("#table_view").empty();
            create_table_display_details(type='asset');
        },
        success: function(json){
            var table = $('#project_table');
                $.each(json, function(idx, data){
                    var row = $('<tr id="'+data.asset_id+'" data-object="AssetBuild">');
                    row.append("<td>" + data.name + "</td>");
                    row.append("<td>" + data.description + "</td>");
                    row.append("<td>" + data.type + "</td>");
                    row.append("<td>"
                    +"<button class='btn btn-xs btn-info' type='button' onclick='view_tasks(this)'>View Task</button>"
                    +"</td>");
                    table.append(row);
            });// end of each loop
            $("#table_view").append(table);
        },
	complete: function(){
	    create_datatable('project_table');
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

    var prj_name =  $("#id_linked_to").val();
    var flag_status = 'update';
    if(asset_name == ""){
        error_message("Asset name must not be empty!!!!");
        return false;
    }
    var pattern = /^[0-9a-zA-Z]+$/;
    if(!pattern.test(asset_name)){
        error_message("Asset name must contain alphanumeric character!!!!");
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
    clear_asset_modal_fields();
    $('#assetModal').modal('hide');
    $('#id_asset_name').removeAttr("disabled");
    $('#id_asset_type').removeAttr("disabled");
    window.setTimeout(function(){
        get_asset_details();
    }, 3000);

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
        mm += 1;
    }
    var s = "0" + mm + "/" + dd + "/" + yy;
    var n = new Date(s)
    var nm = (n.getMonth() + 1);
    var nd = n.getDate();
    if (nm < 10)
        nm = "0" + nm;
    if (nd < 10)
        nd = "0" + nd;

    $("#id_task_due_date").val(n.getFullYear() + "-"+ nm + "-"+ nd).prop("disabled", true);
//    val(nm + "/" + nd + "/" + n.getFullYear()).prop("disabled", true);
    end_date = n.getFullYear() + "-"+ nm + "-"+ nd
    return end_date;
}
/*
    onchange event
    on select to check
    task exists
*/

$("#id_task_name").change(function(){

    var val = $("#id_task_name option:selected").text().trim();
    var th = get_table_header();
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
                check(json);
        }
    });
});
function check(data){
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
    var prj_name = $("#id_linked_to").val().trim();
    var asset_type = $("#id_asset_type option:selected").text().trim();
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
}
/*
    on keypress of project name
    to check if project exists
    or not
*/
$("#id_project_name").focusout(function(){

    var prj_code = $("#id_project_code").val().trim();
    $.ajax({
        type: "POST",
        url:"/callajax/",
        data:{
            "object_name": "Project",
        },
        success: function(json){
            if (json[prj_code]){
                error_message("Project ("+ prj_code +") already exists");
		clear_project_fields();
            }else{
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
    }
    if (th == 'Shot'){
        project_name = str[0];
        sequence_name = str[1];
        shot_name = str[2];
    }
    if (th == 'Asset'){
        project_name = str[0];
        asset_name = str[1];
        set_asset_name(asset_name);
    }
    var sdate = new Date(start_date);
    var edate = new Date(due_date);

    if (task_type == 'Select Option'){
        error_message("Select Valid Option!!!");
        return false;
    }
    if (assignee == 'Select Option'){
        error_message("Select Assignee");
        return false;
    }
    if (bid_days == ''){
        error_message("Bid Days must not be empty!!!");
        return false;
    }
    if (jQuery.isNumeric(bid_days) == 'false'){
        error_message("bid days must be numeric!!!!");
        return false;
    }
    if (start_date == '' && due_date == ''){
        error_message("Date field must not be empty!!!!");
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
}

/*
    function to get task
    details sequence/asset/shot wise
*/
function get_task_details(project_name, parent_id){
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data:{
            "object_name": "display_task_details",
            "project": project_name,
            "parent_id": parent_id
        },
        beforeSend: function(){
            $("#table_view").empty();
            create_table_display_details(type_name='task');
        },
        success: function(json){
            var table = $('#project_table');
            $.each(json, function(idx, data){
                var row = $('<tr id="'+data.task_id+'" data-object="Task">');
                    row.append("<td>" + data.name + "</td>");
                    row.append("<td>" + data.start_date + "</td>");
                    row.append("<td>" + data.end_date + "</td>");
                    row.append("<td>" + data.task_status + "</td>");
                    row.append("<td>" + data.users + "</td>");
                    row.append("<td>" + data.bid + "</td>");
                    row.append("<td>" + data.priority + "</td>");
                    row.append("<td></td>");
//                    row.append("<td>"+
//                    "<button class='btn btn-xs btn-success' type='button' onclick='update_tasks(this)'>Update</button>"
//                    +"</td>");
                    table.append(row);
                    $("#table_view").append(table);
                });
            $("#table_view").show();
        },
	complete: function(){
	    create_datatable('project_table');
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
        var asset_type_name = get_asset_type();

        $("#id_task_name").val(task_name);
        get_details_before_update(project_name, 'Asset_Task', task_name, '', asset_name, entity_id);
        $("#taskModal").modal("show");
    }
    else if (th == "Sequence"){

        $("#id_task_linked_to").val(project_name + ":" + seq_name)
        $("#update_task_details").show();
        $("#submit_task_details").hide();
        get_details_before_update(project_name, 'Sequence_Task', seq_name, '', task_name, entity_id);
        $("#taskModal").modal("show");
    }
    else if (th == "Shot"){

        $("#id_task_linked_to").val(project_name + ":" + seq_name + ":" + shot_name);
        $("#update_task_details").show();
        $("#submit_task_details").hide();
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
    var task_name = get_task_name();
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

    if (th == 'Sequence'){
        project_name = str[0];
        sequence_name = str[1];
    }
    if (th == 'Shot'){
        project_name = str[0];
        sequence_name = str[1];
        shot_name = str[2];
    }
    if (th == 'Asset'){
        project_name = str[0];
        asset_name = str[1];
        set_asset_name(asset_name);
    }
    var sdate = new Date(start_date);
    var edate = new Date(due_date);

    if (sdate > edate){
        error_message("Start date must not exceed end date!!!!");
        return false;
    }
    if (start_date == '' && due_date == ''){
        error_message("Date field must not be empty!!!!");
        return false;
    }
    if (task_name == 'Select Option'){
        error_message("Select Valid Option!!!");
        return false;
    }
    if (assignee == 'Select Option'){
        error_message("Select Assignee");
        return false;
    }
    if (bid_days == ''){
        error_message("Bid Days must not be empty!!!");
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
        "object_name" : "Show Projects"
        },
        beforeSend: function(){
	    var create_proj = '<div class="box col-at-5" style="text-align: center;font-size: 20px;height: 305px;">\
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
                        <div class="box col-at-5" style="background-color: #666; height: 305px;">\
              <ul class="list-group">\
                <li class="list-group-item">\
                  <div style="text-align: right;">\
                    <button class="btn btn-xs btn-info" type="button" onclick="display_view_modal(this)">View</button>\
		    <button class="btn btn-xs btn-success" type="button" onclick="display_proj_modal(this)">Update</button>\
                  </div>\
                  <label>Project &nbsp; Name &nbsp;: &nbsp;</label><a id="'+data.proj_id+'" data-object="Project">'+data.name+'</a>\
                </li>\
                <li class="list-group-item">\
                  <label>Start &nbsp; Date &nbsp;: &nbsp;</label><strong>'+data.start_date+'</strong>\
                </li>\
                <li class="list-group-item">\
                  <label>Resolution &nbsp;: &nbsp;</label><strong>'+data.resolution+'</strong>\
                </li>\
                <li class="list-group-item">\
                  <label>Start &nbsp;Frame &nbsp;: &nbsp;</label><strong>'+data.start_frame+'</strong>\
                </li>\
                <li class="list-group-item">\
                  <label>FPS &nbsp;: &nbsp;</label><strong>'+data.fps+'</strong>\
                </li>\
                <li class="list-group-item">\
                  <label>Path &nbsp;: &nbsp;</label><strong>'+data.proj_path+'</strong>\
                </li>\
              </ul>\
            </div>';
                    $("#table_view").append(new_div);
                });
                $("#table_view").show();
        }
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
        "project": get_project_name(),
        },
        beforeSend:function(){
            $("#table_view").empty();
            create_table_display_details(type='sequence');
        },
        success: function(json){
            var table = $('#project_table');
                $.each(json, function(idx, data){
                    var row = $('<tr id="'+data.seq_id+'" data-object="Sequence">');
                    row.append("<td>" + data.name + "</td>");
                    row.append("<td>" + data.description + "</td>");
                    row.append("<td>" + data.type + "</td>");
                    row.append("<td>"
                    +"<button class='btn btn-xs btn-info' type='button' onclick='display_shots(this)'>View</button></td>");
                    table.append(row);
            });// end of each loop
            $("#table_view").append(table);
        },
	complete: function(){
	    create_datatable('project_table');
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
        var seq = $(name).closest('tr').find('td:eq(0)').text();
        set_sequence_name(seq);
    }
    else if (table_header == "Shot"){
        clear_task_fields();
        var shot = $(name).closest('tr').find('td:eq(0)').text();
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

    parent_id = $(name).closest('tr').attr('id');
    $("#asset_li").hide();
    $("#sequence_li").hide();
    $("#view_asset_li").hide();
    $("#view_seq_li").hide();
    $("#shot_view_li").hide();
    $("#shot_li").hide();
    $("#task_li").hide();
    $("#task_view_li").show();
    $("#task_view_li").attr('data-parent-id', parent_id);
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

    parent_id = $(this).parent().attr('data-parent-id');
    get_task_details(get_project_name(), parent_id);
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
        'project': get_project_name()
        },
        beforeSend:function(){
            $("#table_view").empty();
            create_table_display_details(type='shot');
        },
        success: function(json){
                var table = $('#project_table');
                $.each(json, function(idx, data){
                    var row = $('<tr id="'+data.shot_id+'" data-object="Shot">');
                    row.append("<td>" + data.name + "</td>");
                    row.append("<td>" + data.start_frame + "</td>");
                    row.append("<td>" + data.end_frame + "</td>");
                    row.append("<td>" + data.total_frames + "</td>");
                    row.append("<td>" + data.duration + "</td>");
                    row.append("<td>"+
                    "<button class='btn btn-xs btn-info' type='button' onclick='view_tasks(this)'>View Task</button>"+
                    "</td>");
                    table.append(row);
            });
            $("#table_view").append(table);
        },
	complete: function(){
	    create_datatable('project_table');
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
    parent_id = $(name).closest('tr').attr('id');

    if (type == "Shot"){

        var name = $(name).closest("tr").find("td:eq(0)").text().trim();

        set_shot_name(name);
        set_entity_name("Shot");
        get_task_details(get_project_name(), parent_id);
    }
    else if (type == "Asset"){

        var name = $(name).closest("tr").find("td:eq(0)").text().trim();

        set_asset_name(name);

        var asset_type_name = $(name).closest("tr").find("td:eq(2)").text().trim()

        set_asset_type(asset_type_name);
        set_entity_name("Asset");
        get_task_details(get_project_name(), parent_id);
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

    if($("#table_view #project_table tbody td").length > 0){
	
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
            if (get_table_header() == "Sequence")
                get_sequence_details();
            else if (get_table_header() == "Shot")
                get_shot_details();
            else if (get_table_header() == "Asset")
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
        'project': project_name,
        'sequence_name': seq_name,
        'shot_name': shot_name,
        'asset_name': asset_name,
        'entity_id': entity_id,
        'flag': flag
        },
        success:function(json){
            if(flag == 'project'){
                $.each(json, function(idx, data){
                    $('#project_id #id_project_code').val(data.name);
                    $('#project_id #id_project_code').attr('data-id',data.proj_id);
                    $('#project_id #id_start_date').val(data.start_date);
                    $('#project_id #id_end_date').val(data.end_date);
                    $('#project_id #id_fps').val(data.fps);
                    $('#project_id #id_resolution').val(data.resolution);
                    $('#project_id #id_start_frame').val(data.start_frame);
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
    $('#'+id).style.display = 'block';
}

function light_image_box_close(param) {
    var cls_div = param.closest('div');
    var id = cls_div.id
    $('#'+id).style.display = 'block';
}

//-----------------for new Entity Model---------------------------------------//


$("#selectEntityProject").change(function(){
    $("#selectEntityObject option:selected").prop("selected", false);
    $('#selectEntityObject').val('').trigger("liszt:updated").trigger("chosen:updated");

    $('#selectEntityTask').empty();
    $('#selectEntityTask').append('<option value="">-- Select --</option>');
    $('#selectEntityTask').trigger("liszt:updated").trigger("chosen:updated");

    $("#selectAssetName").empty();
    $('#selectAssetName').trigger('chosen:updated');
    $('#all_assetsName').attr('checked',false);
    $('#assetType').hide()
    $('#div_asset_name').hide();

    $('#selectEntitySequence').empty();
    $('#selectEntitySequence').trigger("liszt:updated").trigger("chosen:updated");
    $('#all_entity_sequences').hide();

    $('#selectEntityShot').empty();
    $('#selectEntityShot').trigger("liszt:updated").trigger("chosen:updated");

    $('#example tfoot').attr('data-selected-tr', '');
    $('#example tfoot').empty();

    $('#div_entity_sequence_name').css({'display': 'none'})
    $('#div_entity_shot_name').css({'display': 'none'})
    $('#create').attr('checked',false);
    $('#create_sq_sc').hide();

});

$("#selectEntityObject").change(function(){
    var project_id = $('#selectEntityProject').val();
    var selected_value = $('#selectEntityObject').val();

    if (!project_id){
        $('#selectEntityObject').val('').trigger("liszt:updated").trigger("chosen:updated");
        alert("Please select valid project !!");
        return null
    }
    $('#entity_loader').show();
    // clear all other elements
    $("#selectAssetName option:selected").prop("selected", false);
    $('#selectAssetName').trigger('chosen:updated');
    $('#all_assetsName').attr('checked',false);
    $('#create').attr('checked',false);
    $('#example tfoot').empty();

    $select_elem = $('#selectSequenceRange');
    $select_elem.empty();
    $select_elem.append('<option value="">Select</option>');
    $select_elem.trigger("chosen:updated");
    $select_elem.trigger("liszt:updated");

    $select_elem01 = $('#selectShotRange');
    $select_elem01.empty();
    $select_elem01.append('<option value="">Select</option>');
    $select_elem01.trigger("chosen:updated");
    $('#shot').css({'visibility': 'hidden'});
    $('#create_sq_sc').css({'visibility': 'hidden'});

    $select_elem02 = $('#selectEndShotRange');
    $select_elem02.empty();
    $select_elem02.append('<option value="">Select</option>');
    $select_elem02.trigger("chosen:updated");

    $select_elem03 = $('#selectShotType');
    $select_elem03.empty();
    $select_elem03.trigger("chosen:updated");
    $('#shot_type').hide()
    $('#create_sq_sc').hide();
    $('#selectSequenceRange_chosen').show();
    $('#lable_id').text("Shot : ")
    $('#example tfoot').attr('data-selected-tr', '');
    $('#selectEntitySequence').empty("");
    $('#selectEntitySequence').trigger("chosen:updated");
    $('#selectEntitySequence').trigger("liszt:updated");
    $('#selectEntityShot').empty("");
    $('#selectEntityShot').trigger("chosen:updated");
    $('#selectEntityShot').trigger("liszt:updated");

    // Check for selected object type
    if(selected_value == 'Asset Build'){
        $('#div_entity_sequence_name').css({'display': 'none'})
        $('#div_entity_shot_name').css({'display': 'none'})
        $('#assetType').css({'display': 'block'})
	$select_elem = $("#selectEntityAssetType");
        load_types($select_elem);
        $('#ast_btn').show();
    }
    if(selected_value == 'Shot'){
        $('#div_entity_sequence_name').css({'display': 'block'})
        $("#selectEntityAssetType option:selected").prop("selected", false);
        $('#selectEntityAssetType').trigger('chosen:updated');
        $('#assetType').css({'display': 'none'})
        $('#ast_btn').hide();
        $('#div_asset_name').css({'display': 'none'})
        $('#selectEntityTask').empty();
        $('#selectEntityTask').trigger('chosen:updated');
        $('#all_entity_sequences').hide();

        var selected_shot_type = 'Static shot'
        get_task(selected_value, selected_shot_type) //call get_task method for fetching tasks
        load_entity_obj_name('Sequence'); // load sequence name
    }
    if(selected_value == 'Sequence'){
        $("#selectEntityAssetType option:selected").prop("selected", false);
        $('#selectEntityAssetType').trigger('chosen:updated');
        $('#assetType').css({'display': 'none'})
        $('#ast_btn').hide();
        $('#div_asset_name').css({'display': 'none'})
        $('#selectEntityTask').empty();
        $('#selectEntityTask').trigger('chosen:updated');
        $('#div_entity_shot_name').css({'display': 'none'})
        $('#all_entity_sequences').show();
        var Sequence_type = 'Sequence'
        get_task(selected_value, Sequence_type) //call get_task method for fetching tasks
        load_entity_obj_name('Sequence'); // load sequence name
    }
    $('#entity_loader').hide();
});

$("#selectEntityAssetType").change(function(){
    var selected_object = $('#selectEntityObject').val();
    var selected_asset_type = $('#selectEntityAssetType').val();
    $("#selectAssetName option:selected").prop("selected", false);
    $('#selectAssetName').trigger('chosen:updated');
    $('#all_assetsName').attr('checked',false);
    $('#chk_seq').show();


    $('#example tfoot').attr('data-selected-tr', '');
    $('#example tfoot').empty();
    $select_elem = $('#selectEntityTask');

    get_task(selected_object, selected_asset_type) //call get_task method for fetching tasks
    load_asset_task_name(); // load asset name
    $('#div_asset_name').css({'display': 'block'})
});


// For fetching task name
function get_task(selected_object, selected_type){
    var $select_elem = $('#selectEntityTask');
    $('#entity_loader').show();
    // call ajax
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'selected_object' : selected_object, 'selected_asset_type': selected_type, 'object_name': 'Load Task'},
        beforeSend: function(){
            $select_elem.empty();
            $select_elem.append('<option value="">-- Select --</option>');
        },
        success: function(json){
            $.each(json, function (idx, obj) {
		    $select_elem.append('<option value="'+obj+'">' + obj+ '</option>');
            });
            $select_elem.trigger("chosen:updated");
            $select_elem.trigger("liszt:updated");
            $select_elem.data("chosen").destroy().chosen();
            $('#entity_loader').hide();
        },
        error: function(error){
            console.log("Error:\n" + error);
       }
    });
}

// For load asset task name
function load_asset_task_name(selectedValue, asst_name){
    var selected_project = $('#selectEntityProject option:selected').text();
    var selected_object = $('#selectEntityObject').val();
    var selected_asset_type = $('#selectEntityAssetType').val();
    var selected_task = $('#selectEntityTask').val();
    $('#entity_loader').show();
    //call
    $select_elem = $('#selectAssetName');
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: { 'project': selected_project, 'selected_task': selected_task,
        'selected_object' : selected_object, 'object_type': selected_asset_type, 'object_name': 'Asset Build'},
        beforeSend: function(){
	     if(!selectedValue){
	       $select_elem.empty();
		}
	    },
        success: function(json){
            $.each(json, function (idx, obj) {
                if(!selectedValue){
                   $select_elem.append('<option value="'+obj.id+'">' + obj.name+ '</option>');
                }
                else{
                    var index = selectedValue.indexOf(obj.id);
                    if(index == -1){
                        $select_elem.append('<option value="'+obj.id+'">' + obj.name+ '</option>');
                    }
                }
            });
            $select_elem.trigger("chosen:updated");
            $select_elem.trigger("liszt:updated");
            $select_elem.data("chosen").destroy().chosen({search_contains:true});
            $('#entity_loader').hide();
        },
        error: function(error){
            console.log("Error: \n" + error);
        }
    });
}

// Select Asset Name and load data
$("#selectAssetName").on('change', function(evt, params) {
    var project_name = $('#selectEntityProject option:selected').text();
    var selected_asset_type = $('#selectEntityAssetType').val();
    var selected_task = $('#selectEntityTask').val();
    var selected_object = $('#selectEntityObject').val();
    var deselectedValue = params.deselected;
    var selectedValue=params.selected

    if(!selected_task){
        return null
    }
    if (selectedValue)
    {
        var selectedValues = [selectedValue]
        load_entity_tasks(selectedValues, project_name, selected_object, selected_task);
        $('#all_assetsName').attr('checked',false);
    }
    else if (deselectedValue){
        var asset_name = $("#selectAssetName option[value='"+deselectedValue+"']").text();
        $("#example tr:contains("+ asset_name +")").remove();
        $('#all_assetsName').attr('checked',false);
    }
});

// For load entity tasks details on table
function load_entity_tasks(selectedValues, project_name, selected_object, selected_task){
    var parent_ids = ""
    var $chk_elem = ""
    var shot_ids = ""
    var parent_ids = selectedValues.join();

    if(selected_object == "Asset Build"){
        chk_elem = $("#all_assetsName")
    }
    if(selected_object == "Shot"){
        chk_elem = $("#all_entity_shots");
    }
    $chk_elem = $("#all_assetsName");

    html = ''
    $('#entity_loader').show();
    //call ajax
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: {'parent_ids': parent_ids, 'project': project_name, 'selected_object': selected_object,
        'selected_task': selected_task, 'object_name': 'Load Entity Task'},
        beforeSend: function(){
         if($('#all_assetsName').is(':checked') || $('#all_entity_shots').is(':checked')){
                $('#example tfoot').empty();
	     }
	    },
        success: function(json){
            html = add_entity_rows(json, selected_object);
            $('#example tfoot').prepend(html);
            $('#entity_loader').hide();
            $('#example tfoot').attr('data-selected-tr', '');

            $('#reset').val("");
            $('#save').val("");
            $('#reset').hide();
            $('#save').hide();
            $('#example tfoot tr').removeClass('selected');
            $('#example tfoot tr').removeClass('selected_tr');
            $('#example tfoot').attr('data-selected-tr', "");
        },
	complete: function(){
//	    create_datatable('example');
	},
        error: function(error){
            console.log("Error:\n" + error);
        }
    });

}
// For append table rows
function add_entity_rows(json, selected_object){
    $('#entity_loader').show();
    html = '';
    if(selected_object == 'Shot'){
    $('#example thead th:nth-child(8)').show();
    $('#example thead th:nth-child(9)').show();

    }else{
    $('#example thead th:nth-child(8)').hide();
    $('#example thead th:nth-child(9)').hide();

    }

    $.each(json, function (idx, obj) {
	        if(idx == 0){
	            tr_count = $('#example tfoot tr').length;
	            idx = tr_count
	        }
	        html = html + '<tr id="'+idx+'" data-project="'+obj.project+'" org-data="" task-id="'+obj.task_id+'" current_users="'+obj.current_assignees+'" data-task-parent-id="'+obj.parent_id+'" parent_object_type="'+obj.parent_object_type+'" onclick="RowClick(this,false,event)"><td data-task-id="'+obj.task_id+'" data-task-parent-id="'+obj.parent_id+'"><a href="#" id="parent_object" onclick="show_model(this)">'+obj.name+'</a></td>'
            html = html + '<td ondblclick="editEntityCell(this)" option-id="users_options" data-org-val=""><label class="label label-default">'+obj.current_assignees+'</label></td>'
            html = html + '<td ondblclick="editEntityCell(this)" option-id="status_options" data-org-val=""><span class="label label-'+obj.status_label+'">'+obj.status+'</span></td>'
            html = html + '<td ondblclick="editEntityCell(this)" option-id="bids_options" data-org-val=""><span class="label label-default">'+obj.bid+'</span></td>'
            html = html + '<td ondblclick="editEntityCell(this)" option-id="complexity_options" data-org-val=""><span class="label label-default">'+obj.complexity+'</span></td>'
            html = html + '<td ondblclick="addDate(this)" data-org-val=""><input type="text"  onchange="select_change(this);" style="display: none;" id="inp_'+idx+'" data-id="'+idx+'" class="x-form-field x-form-text x-form-empty-field"><span id="spn_'+idx+'" class="label label-default">'+obj.startdate+'</span></td>'
            html = html + '<td ondblclick="editEntityCell(this)" option-id="description_option" data-org-val=""><span class="label label-default">'+obj.description+'</span></td>'

            if(selected_object == "Shot"){
                   html = html + '<td ondblclick="editEntityCell(this)" option-id="stframe_options" data-org-val=""><span class="label label-default">'+obj.startframe+'</span></td>'
                   html = html + '<td ondblclick="editEntityCell(this)" option-id="edframe_options" data-org-val=""><span class="label label-default">'+obj.endframe+'</span></td>'
            }
            html = html + '<td><button class="btn btn-inverse btn-default btn-xs" data-toggle="dropdown" id="incoming" onclick="show_entity_link_model(this)" >Link Asset</button></td>'

            html = html + '<td><button class="btn btn-inverse btn-default btn-sm" onclick="single_reset('+idx+')" style="display: none;" id="td_'+idx+'"><i class="glyphicon glyphicon-hand-left icon-white"></i>&nbsp;&nbsp;Undo</button></td>'
            html = html + '</tr>'
            });
    $('#entity_loader').hide();
    return html
}

// For display all tasks using checkbox
$("#all_assetsName").click(function(){
    if (this.checked){
        $('#selectAssetName option').prop('selected', true);
        $('#selectAssetName').trigger('chosen:updated');
        var project_name = $('#selectEntityProject option:selected').text();
        var selected_asset_type = $('#selectEntityAssetType').val();
        var selected_task = $('#selectEntityTask').val();
        var selectedValues = []
        $("#selectAssetName option").each(function()
            {
               selectedValues.push($(this).val());
            });
        if(!selected_task){
            return null
        }
        load_entity_tasks(selectedValues, project_name, selected_asset_type, selected_task);
    }else{
        $('#example tfoot').empty();
        $("#selectAssetName option:selected").prop("selected", false);
        $('#selectAssetName').trigger('chosen:updated');
	}
});

// For selecting task
$("#selectEntityTask").change(function(){
    var project_name = $('#selectEntityProject option:selected').text();
    var selected_object = $('#selectEntityObject').val();
    var selected_task = $('#selectEntityTask').val();
    var selectedValues = []
    var $selected_element = ''
    var $check_all = ''

    // hides create div
    $('#create_sq_sc').hide();
    $('#create').attr('checked',false)

    //Checking for selected object
    if(selected_object == 'Asset Build'){
        $selected_element = $("#selectAssetName");
        $check_all = $("#all_assetsName");
    }
    if(selected_object == 'Sequence'){
        $selected_element = $("#selectEntitySequence");
        $check_all = $("#all_entity_sequences");
        $('#chk_seq').show();
    }
    if(selected_object == 'Shot'){
        $selected_element = $("#selectEntityShot");
        $('#chk_seq').hide();
    }
    selectedValues= $($selected_element).val();
    if(!selectedValues){
        alert("Select " + selected_object + " type")
        return null
    }
	else{
	    $('#example tfoot').empty();
	    load_entity_tasks(selectedValues, project_name, selected_object, selected_task)
	}
});

// For edit table rows
function editEntityCell(context, option){
    context_data = String($(context).html().search('<select'));
    if(context_data == 0)
    {
        return null;
    }
    var col_index = $(context).index();
    var $select_elm = '';
    var option = $(context).attr('option-id');
    var $tr_element = $(context).closest('tr');
    var trid = $tr_element.attr('id');
    var tr_clone = $('#'+trid).html();
    var OriginalContent = $(context).text();
    $tr_element.attr('data-td', OriginalContent);
    if(option != "description_option"){
        OriginalContent = OriginalContent.replace(/^\s+/ig,'');
        OriginalContent = OriginalContent.replace(/\s+$/ig,'');
        var clone = $('#'+option).clone(true);
        $clonedChosen = clone.find('select').clone().off()

        $parentTd = $(context).closest('td');
        $parentTd.empty().append($($clonedChosen).show("show"));

        $select = $parentTd.find('select')
        $select.chosen({width: "150px"})
        var td_content = OriginalContent
        if(option == 'users_options'){
            current_user = $(context).closest('tr').attr('current_users');
            if(!current_user){
                $(context).closest('tr').attr('current_users', OriginalContent);
            }
            OriginalContent = OriginalContent.split(',')
        }
        org = OriginalContent
        $select.val(OriginalContent).trigger("liszt:updated");
        $select.trigger('focusout');

        $select.trigger("chosen:updated");

        $select.trigger('chosen:open');
        $select_elm = $select
        $select.on('chosen:hiding_dropdown', function () {
            if($select.val() == td_content || $select.val() == null){
                var html = ''
                if(col_index == 2){
                    status = OriginalContent
                    status_label = status.toLowerCase().replace(/\s/g, "_");
                    html = '<span class="label label-'+status_label+'">'+status+'</span>'
                }
                else{
                    html = '<span class="label label-default">'+OriginalContent+'</span>'
                }
                $(context).html(html)
            }
        });

    }
    else{
        var clone = $('#'+option).clone(true);
        $clonedChosen = clone.find('input').clone().off()
        $parentTd = $(context).closest('td');
        $parentTd.empty().append($($clonedChosen).show("show"));
        $parentTd.find('input').focus();
        $select_elm = $parentTd.find('input');

        $select_elm.on('blur', function () {
             var html = ''
             html = '<span class="label label-default">'+OriginalContent+'</span>'
            $(context).html(html)
        });
    }

     // for add attribute on tr
     if(!$tr_element.attr('org-data')){
        $tr_element.attr('org-data', tr_clone);
        var tr_ids = $('#reset').val();
        if(tr_ids)
        {
            tr_ids = tr_ids +',' + trid
        }
        else{
            tr_ids = trid
        }
        $('#reset').val(tr_ids);
    }
}


// For add date
function addDate(param){
    var $tr_element = $(param).parent();
    var trid = $tr_element.attr('id');
    var tr_clone = $('#'+trid).html();

    // for date picker
    var today = new Date();
    // for date picker
    $(param).datepicker({
      format: 'yyyy-mm-dd',
      autoclose: true,
      startDate: today
    }).on('change', function(){
        $('.datepicker').hide();
    });
    $(param).children('span').hide();
    $(param).children('input').show();
    $(param).children('input').focus();
    //
    $select_elm = $(param).children('input')
    $select_elm.on('blur', function (){
        $(param).children('span').show();
        $(param).children('input').hide();
    });

    // for add attribute on tr
    if(!$tr_element.attr('org-data')){
        $tr_element.attr('org-data', tr_clone);
        var tr_ids = $('#reset').val();
        if(tr_ids)
        {
            tr_ids = tr_ids +',' + trid
        }
        else{
            tr_ids = trid
        }
        $('#reset').val(tr_ids);
    }
}

// For edit columns of table rows
function select_change(param){
    var $tr_element = $(param).closest('tr');
    var trid = $(param).parent().closest('tr').attr('id');
    var td_index = $(param).closest('td').index();
    var html = ""
    $(param).closest('td').removeClass('selected_td');
    var trs = ''
    trs = $('#example tfoot').attr('data-selected-tr');
    var trs_array = []
    trs_array = trs.split(",");

    var ind = trs_array.indexOf(trid);
    // if for set status label color class
    if(td_index == 2){
        status = $(param).val();
        status_label = status.toLowerCase().replace(/\s/g, "_");
        html = '<span class="label label-'+status_label+'">'+status+'</span>'
        $('#'+trid).find("td:eq("+td_index+")").html(html);
        $(param).closest('span').show();
        $(param).hide();
    }
    else if(td_index == 5 || td_index == -1){
        tid = $(param).attr('data-id');
        html = '<input type="text"  onchange="select_change(this);" style="display: none;" id="inp_'+tid+'" data-id="'+tid+'" class="x-form-field x-form-text x-form-empty-field">'
        html = html + '<span id="spn_'+tid+'" class="label label-default">'+$(param).val()+'</span>'
        $('#'+tid).find("td:eq("+5+")").html(html);
        $(param).hide();
        $(param).closest('span').show()
    }
    else{
        param_val = $(param).val();
        if(param_val == null){
            param_val = '---'
        }
        html = '<span class="label label-default">'+param_val+'</span>'
        $('#'+trid).find("td:eq("+td_index+")").html(html);
    }
    //
    if(ind == -1){
        $('#'+trid).addClass('selected');
        }
        else{
            $('#'+trid).addClass('selected_tr');
        }

    //
    var tr_ids = $('#save').val();
    flag = ""
    if($(param).attr('id') == "selectStartFrame"){
       get_endframe_range($(param).attr('id'), $(param).val())
        flag = "0"
        html = '<span class="label label-default">'+$(param).val()+'</span>'
        $('#'+trid).find("td:eq("+8+")").html(html);
        $('#'+trid).addClass('selected_tr');
    }
    else{
        flag = "0"
    }
    // for multiple select rows
    if(trs && ind != -1 || trs && td_index == -1){
             //trs_array = trs.split(",");
             for(i=0; i<trs_array.length; i++ ){
                var tr_clone = $('#'+trs_array[i]).html();
                var $tr_element = $('#'+trs_array[i]);
                 if(!$tr_element.attr('org-data')){
                    $tr_element.attr('org-data', tr_clone);
                 }
                 $('#'+trs_array[i]).find("td:eq("+td_index+")").html(html)
                 $('#td_'+trs_array[i]).show();
                 $('#'+trs_array[i]).find("td:eq("+td_index+")").removeClass('selected_td');
         }
    }
    // for single select rows
    if(flag = "0" && !tr_ids == '')
    {
         tr_ids_array = tr_ids.split(",");
         for(var j=0; j<tr_ids_array.length; j++){
           var idj = tr_ids_array[j];
           if(trs_array.indexOf(idj) == -1)
           {
            trs_array.push(idj)
           }
         }
         //tr_ids = tr_ids +',' + trid
         if(trs_array.indexOf(trid) == -1){
            trs_array.push(trid)
         }
         tr_ids_array.push(trid)
         $('#reset').val(trs_array);
         $('#save').val(trs_array);
         $('#td_'+trid).show();
    }else{
        if(trs_array.indexOf(trid) == -1 && trs_array.length > 0){
            trs_array.push(trid)
            trs_array.splice(0,1)
         }
        tr_ids = trid
        $('#save').val(trs_array);
        $('#reset').val(trs_array);
        $('#td_'+trid).show();
    }
    $('#reset').show();
    $('#save').show();
    $(param).closest('span').show();
}


// For reset selected or edited rows
$("#reset").on('click', function(context) {
    var tr_ids = $('#reset').val();
    if(!tr_ids){
        $('#example tfoot').attr('data-selected-tr', '');
        clearAll();
        return null;
    }
    else{
        var cnf = window.confirm("Do you want to reset changes...!");
        if(cnf){
            tr_ids_array = tr_ids.split(",");
            for(var i = 0; i < tr_ids_array.length; i++){
                var org_val = $('#'+tr_ids_array[i]).attr('org-data');
                $('#'+tr_ids_array[i]).html(org_val);
                $('#'+tr_ids_array[i]).attr('org-data', "")
                $('#td_'+tr_ids_array[i]).hide();
                $('#'+tr_ids_array[i]).removeClass('selected');
                $('#'+tr_ids_array[i]).removeClass('selected_tr');

                $('#'+tr_ids_array[i]).find("td:eq(3)").removeClass('selected_td');
                $('#'+tr_ids_array[i]).find("td:eq(7)").removeClass('selected_td');
                $('#'+tr_ids_array[i]).find("td:eq(8)").removeClass('selected_td');
            }
            $('#reset').val("");
            $('#save').val("");
            $('#example tfoot').attr("data-selected-tr", "");

            $('#reset').hide();
            $('#save').hide();
       }
    }
});

// For single row reset or undo
function single_reset(id) {
    id = id.toString();
    var org_val = $('#'+id).attr('org-data');

    $('#'+id).html(org_val);
    $('#'+id).attr('org-data', "")
    //
    var tr_ids = $('#reset').val();

    var reset_ids_list = [];
    reset_ids_list = tr_ids.split(",");
    var index = reset_ids_list.indexOf(id);
    reset_ids_list.splice(index, 1);
    $('#reset').val(reset_ids_list);

    var trs = $('#example tfoot').attr("data-selected-tr");
    var trs_array = []
    trs_array = trs.split(",");
    var ind = trs_array.indexOf(id);

    if(trs && ind != -1){
        trs_array.splice(ind, 1);
        $('#example tfoot').attr("data-selected-tr", trs_array);
    }
    var save_ids_list = tr_ids.split(",");
    $('#save').val(reset_ids_list);
    $('#'+id).removeClass('selected');
    $('#'+id).removeClass('selected_tr');

    $('#'+id).find("td:eq(3)").removeClass('selected_td');
    $('#'+id).find("td:eq(7)").removeClass('selected_td');
    $('#'+id).find("td:eq(8)").removeClass('selected_td');

    if(save_ids_list == "" || reset_ids_list == ""){
        $('#reset').hide();
        $('#save').hide();
    }
}

// ------- save edit data rows ---------------//
$("#save").on('click', function(context) {
    var tr_ids = $('#save').val();
    var ids_list = []
    var data_list = []
    if(!tr_ids){
        return null;
    }
    else{
        ids_list = tr_ids.split(",");
        for(i=0; i< ids_list.length; i++)
        {
            if(ids_list[i] == null || ids_list[i] == '')
            {
             ids_list.splice(i,1);
            }
        }

        data_list = create_data_list(ids_list)
        b = 0
        s = 0
        e = 0
        for(var i = 0; i < data_list.length; i++){
            //var bid = data_list[i]['bid']
            var bid = parseFloat($('#'+data_list[i]['id']).find("td:eq(3)").text())*(10*60*60)
            if(bid == 0 || bid == null){
                // col1=$('#'+ids_list[i]).find("td:eq(0)").text();
                b = 1
                td = $('#'+ids_list[i]).find("td:eq(3)").find('span');
                $(td).addClass('selected_td')

            }
          /*  if($('#selectEntityObject').val() == 'Shot'){
                var stf = data_list[i]['startframe']
                var edf = data_list[i]['endframe']
                if(stf == 0 || stf == null){
                    // col1=$('#'+ids_list[i]).find("td:eq(0)").text();
                    s = 1
                    td = $('#'+ids_list[i]).find("td:eq(7)").find('span');
                    $(td).addClass('selected_td')
                }
                if(edf == 0 || edf == null){
                    // col1=$('#'+ids_list[i]).find("td:eq(0)").text();
                    e = 1
                    td = $('#'+ids_list[i]).find("td:eq(8)").find('span');
                    $(td).addClass('selected_td')
                }
            }*/
        }

        if(b == 1 || s == 1 || e == 1 || b == '---' )
        {
            alert("Please select required fields......!")
            return null;
        }

        var cnf = window.confirm("Do you want to save changes...!");
        if(cnf){
            save_data(data_list, ids_list); //call save data function for store edit table rows
            for(var i = 0; i < ids_list.length; i++){
                $('#td_'+ids_list[i]).hide();
                $('#'+ids_list[i]).attr('org-data', "")
            }
            $('#reset').val("");
            $('#save').val("");
            $('#reset').hide();
            $('#save').hide();
            $('#example tfoot tr').removeClass('selected');
            $('#example tfoot tr').removeClass('selected_tr');
            $('#example tfoot').attr('data-selected-tr', "");
        }
    }
});

// For create data list from table columns
function create_data_list(ids_list){
    var page = $('#task_menu1').find('li.active').first('a span').text().trim();
    var priority_dict = {"A":'Urgent', "B":'High', "C":'Medium', "D":'Low'};
    var child_task_name = $('#selectEntityTask').val();
    var project_id = $('#selectEntityProject').val();
    var project_name = $('#selectEntityProject option:selected').text();
    var object_type = $('#selectEntityObject').val();
    var asset_type = $('#selectEntityAssetType').val();
    var data_list = []
    for(var i = 0; i < ids_list.length; i++){
        //-----------------
        var org_data = $('#'+ids_list[i]).attr('org-data');
        var $org_data_tr = '<tr>' + org_data + '<>/tr'

        var data_dict = {}
        var col1 = col2 = col3 = col4 = col5 = col6 = col7= ""
        var current_users_list = $('#'+ids_list[i]).attr('current_users');
        var parent_id = $('#'+ids_list[i]).attr('data-task-parent-id');
        var parent_object_type = $('#'+ids_list[i]).attr('parent_object_type');
        var task_id = $('#'+ids_list[i]).attr('task-id');
        // name
        col1 = $('#'+ids_list[i]).find("td:eq(0)").text();
        //user
        col2 = $('#'+ids_list[i]).find("td:eq(1)").text();
        // status
        col3 = $('#'+ids_list[i]).find("td:eq(2)").text();
        // bid
        col4 = $('#'+ids_list[i]).find("td:eq(3)").text()
        // complexity
        col5 = $('#'+ids_list[i]).find("td:eq(4)").text();
        // start date
        col6 = $('#'+ids_list[i]).find("td:eq(5)").text();
        // description
        col7 = $('#'+ids_list[i]).find("td:eq(6)").text();

        //---------------------------------
        data_dict['task_id'] = task_id
        org_col3 = $($org_data_tr).find("td:eq(3)").text()
        //if(col4 != '0'){}
        if(col2 != $($org_data_tr).find("td:eq(1)").text()){
            data_dict['assignee'] = col2
            data_dict['current_users'] = current_users_list

            }
        if(col3 != $($org_data_tr).find("td:eq(2)").text() || org_col3 == '0'){
            data_dict['task_status'] = col3
            }
        if(col4 != $($org_data_tr).find("td:eq(3)").text() ){
            data_dict['bid'] = parseFloat(col4)*(10*60*60);
            }
        if(col5 != $($org_data_tr).find("td:eq(4)").text() || org_col3 == '0'){
            data_dict['priority'] = priority_dict[col5]
            }
        if(col6 != $($org_data_tr).find("td:eq(5)").text() || org_col3 == '0' || col4 != $($org_data_tr).find("td:eq(3)").text()){
            data_dict['start_date'] = col6
            b = $('#'+ids_list[i]).find("td:eq(3)").text()
            ed = assign_end_date_bid_days_start_date(b, col6)
            data_dict['end_date'] = ed

            }
        if(col7 != $($org_data_tr).find("td:eq(6)").text() || $($org_data_tr).find("td:eq(1)").text() == '0'){
            data_dict['description'] = col7
            }

        if(object_type == 'Shot'){
            // start frame
            var str_frame = $('#'+ids_list[i]).find("td:eq(7)").text();
            col8 = str_frame
            // End Frame
            var enf_frame = $('#'+ids_list[i]).find("td:eq(8)").text();
            col9 = enf_frame
            if(col8 != $($org_data_tr).find("td:eq(7)").text() || org_col3 == '0'){
                data_dict['startframe'] = col8
                }
            if(col9 != $($org_data_tr).find("td:eq(8)").text() || org_col3 == '0'){
                data_dict['endframe'] = col9
                }
        }
        data_dict['id'] = ids_list[i];
        data_dict['parent_id'] = parent_id;
        data_dict['task_name'] = child_task_name;
        data_dict['parent_object_type'] = parent_object_type;
        data_dict['project_id'] = project_id;
        data_dict['project_name'] = project_name;
        data_dict['page'] = page;
        var path = project_name + ':' + col1.replace('_', ':') + ':' +child_task_name;
        data_dict['path'] = path;
        data_list.push(data_dict);


    }
    return data_list
}



// Save edit table rows data
function save_data(data_list, ids_list){
    var selected_project = $('#selectEntityProject option:selected').text();
    var selected_object = $('#selectEntityObject').val();
    var selected_asset_type = $('#selectEntityAssetType').val();
    var selected_task = $('#selectEntityTask').val();
    var data_str_list = JSON.stringify(data_list);
    var params = $("#selectAssetName");
    var selectedValue= ''
    if(selected_object == 'Asset Build'){
        selectedValue = $("#selectAssetName").val();
    }
    if(selected_object == 'Shot'){
        selectedValue = $("#selectEntityShot").val();
    }
    if(selected_object == 'Sequence'){
        selectedValue = $("#selectEntitySequence").val();
    }
    var priority_dict = {'Urgent': "A", 'High': "B", 'Medium': "C", 'Low': "D"}
    if (selectedValue)
    {
        selectedValue = [selectedValue]
    }
    var parent_ids = selectedValue.join();
    //call ajax
    $('#entity_loader').show();
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: {'project': selected_project, 'object_name': 'Update Form Data', 'entity_name' : "Task", "data_list": data_str_list},
        beforeSend: function(){
            $('#panel_big').plainOverlay('show');
	     },
        success: function(json){
            if(selected_object == 'Shot'){
                $('#example thead th:nth-child(8)').show();
                $('#example thead th:nth-child(9)').show();
                }else{
                $('#example thead th:nth-child(8)').hide();
                $('#example thead th:nth-child(9)').hide();
            }
            $('#panel_big').plainOverlay('hide');
            $('#entity_loader').hide();
        },
        error: function(error){
            console.log("Error:\n" + error);
        }
    });
}

// For check for duplicate asset name
$("#asst_name").on('change  paste', function() {
    var name = $(this).val();
    var exist = "";
    $("#selectAssetName option").each(function()
    {
      if($(this).text() == name){
        exist = "true"
      }
    });
    if(exist){
    $('#msg').show();
    $("#addAsset").attr("disabled", true);
    }
    else{
        $('#msg').hide();
         $("#addAsset").attr("disabled", false);
    }
});

// --------- show create asset form -------------//
$('#add').on('click', function(param){
    if(!$('#selectEntityAssetType').val()){
        alert("Please select Asset Type...!")
        return null;
    }
    var data_id = $('#add').attr('data-id');
    if(data_id == "0"){
        $('#demo').show();
        $('#add').attr('data-id', "1");
    }
    else{
        $('#asst_name').val('');
        $('#asset_description').val('');
        $('#demo').hide();
        $('#add').attr('data-id', "0");
    }

});
// For add asset name
$('#addAsset').on('click', function(){
    var asset_name = $('#asst_name').val();
    if(!asset_name){
        alert("Please enter asset name.");
        return null;
    }
    var page = $('#task_menu1').find('li.active').first('a span').text().trim() 
    var project_name = $('#selectEntityProject option:selected').text();
    var asset_description = $('#asset_description').val();
    var parent_object = "Project"
    var asset_build_type = $('#selectEntityAssetType').val();
    var parent_id = $('#selectEntityProject').val();
    var entity_name = "AssetBuild"
    var data_dict = {}
    var data_list = []

    data_dict['asset_build_name'] = asset_name;
    data_dict['entity_name'] = entity_name;
    data_dict['description'] = asset_description;
    data_dict['parent_object'] = parent_object;
    data_dict['asset_build_type'] = asset_build_type;
    data_dict['parent_id'] = parent_id;
    data_dict['project_name'] = project_name;
    data_dict['page'] = page;
    data_dict['action'] = 'add';
    var path = project_name + ':' + asset_name;
    data_dict['path'] = path;
    data_list.push(data_dict);
    data_str_list = JSON.stringify(data_list);
    //call
    $('#entity_loader').show();
    var selected_assets = $('#selectAssetName').val();
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: {'object_name': 'Update Form Data', 'data_list': data_str_list, 'entity_name': 'AssetBuild', 'project': project_name},
        beforeSend: function(){
           // $('#panel_big').plainOverlay('show');
	     },
        success: function(json){
            noty({
                text: 'Asset task added successfully ...',
                layout: 'topCenter',
                closeWith: ['click', 'hover'],
                type: 'success'
            });

            load_asset_task_name(selected_assets, asset_name);

            $('#all_assetsName').attr('checked',false)
            $('#asst_name').val('')
            $('#asset_description').val('');
            //$('#panel_big').plainOverlay('hide');
            $('#entity_loader').show();
        },
        error: function(error){
            console.log("Error:\n" + error);
        }
    });
});

// -------- prevent special character --------- //
$('#asst_name').on('keypress', function (event) {
    var regex = new RegExp("^[a-zA-Z0-9\b]+$");
    var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
    if (!regex.test(key)) {
       event.preventDefault();
       return false;
    }
});

// For load Sequence and Shot names
function load_entity_obj_name(obj_name, parent_id, opt_val='') {
    var project = $('#selectEntityProject').val();
    var select_type = ''
    var $div_name = ''
    var $select_elem = ''

    if (obj_name == 'Sequence'){
        $select_elem = $("#selectEntitySequence");
        $div_name = $("#div_entity_sequence_name")
    }else if (obj_name == 'Shot'){
        $select_elem = $("#selectEntityShot");
        $div_name = $("#div_entity_shot_name")
    }else{
        return null
    }
    $('#entity_loader').show();
    // call ajax
    $.ajax({
        type:"POST",
        url:"/callajax/",
        data: {'project': project, 'object_name': obj_name, 'parent_id' : parent_id },
        beforeSend: function(){
            if((!$('#selectEntitySequence').val()))
            {
                $select_elem.empty();
            }
        },
        success: function(json){
            $div_name.css({'display':'block'});

            var shots_array = []
            $.each(json, function (idx, obj) {
                opt_text = ''
                opt_id = obj.id
                if(parent_id){
		            opt_text = obj.parent_name+'_'+obj.name
                }else{
		            opt_text = obj.name
                }

                $select_elem.append('<option value="'+opt_id+'">' + opt_text + '</option>');
                shots_array.push(obj.name)
            });
            $select_elem.trigger("chosen:updated");
            $select_elem.trigger("liszt:updated");
            $select_elem.data("chosen").destroy().chosen({search_contains:true});
            $('#entity_loader').hide();
        },
        error: function(error){
            console.log("Error:\n" + error);
        }
    });
}

// sequence box
$('#selectEntitySequence').on('change', function(evt, params) {
    $('#all_shots').attr('checked',false);
    var obj_name = $("#selectEntityObject").val();
    if (!obj_name){
        alert("Please select valid Object!")
        return null
    }

    var deselectedValue = '' //params.deselected;
    var selectedValue = '' //params.selected;
    if(params){
        deselectedValue = params.deselected;
        selectedValue = params.selected;
    }
    if (selectedValue && obj_name == 'Shot'){
        var obj_name = 'Shot';
        load_entity_obj_name(obj_name,selectedValue); // load shots name
    }else if (selectedValue && obj_name == 'Sequence'){
        display_tasks(evt, params)
    }
    else if (deselectedValue && obj_name == 'Shot'){
        de_seq = $("#selectEntitySequence option[value='"+deselectedValue+"']").text();
        $("#selectEntityShot option:contains('"+de_seq+"_')").remove();
        $("#selectEntityShot").trigger("chosen:updated");
        $("#selectEntityShot").trigger("liszt:updated");
        $("#example tfoot tr:contains('"+ de_seq +"_')").remove();
        $('#all_entity_shots').attr('checked',false);
    }
    else{
        de_seq = $("#selectEntitySequence option[value='"+deselectedValue+"']").text();
        $("#selectEntitySequence").trigger("chosen:updated");
        $("#selectEntitySequence").trigger("liszt:updated");
        $("#example tfoot tr:contains("+ de_seq +")").remove();
        $('#all_entity_sequences').attr('checked',false);
        $('#all_entity_shots').attr('checked',false);
    }
});


// For entity shot
$('#selectEntityShot').on('change', function(evt, params) {
        display_tasks(evt, params)
});


//function for display task
function display_tasks(evt, params){
    var project_name = $('#selectEntityProject option:selected').text();
    var selected_task = $('#selectEntityTask').val();
    var object = $('#selectEntityObject').val();
    var elem_id = $(params).id
    if (!project_name){
        alert("Please select valid project !!");
        return null;
    }
    if (!selected_task){
        //alert("Please select task !!");
        return null;
    }
    var deselectedValue = params.deselected;
    var selectedValue = params.selected;

    if (selectedValue){
        var selectedValues = [selectedValue]
        load_entity_tasks(selectedValues, project_name, object, selected_task) // load tasks table data
    }else if (deselectedValue){
        var shot_name = $("#selectEntityShot option[value='"+deselectedValue+"']").text();
        $("#example tr:contains("+ shot_name +")").remove();
        $('#all_entity_shots').attr('checked',false);
    }
}

// For create entity things
$("#create").click(function(){
    var selected_object = $('#selectEntityObject').val();
    if(!selected_object){
        alert("Please select object type!");
        $('#create').attr('checked',false);
        return null;
    }
    var selected_task = $('#selectEntityTask').val();
    if(selected_object == 'Shot' && selected_task != 'Layout'){
        alert(selected_object + " will be create in Layout only...!");
        $('#create').attr('checked',false);
        return null;
    }
    
    if (this.checked){
        $('#create_sq_sc').css({'visibility': ''});
        $('#create_sq_sc').show();
        var project_name = $('#selectEntityProject option:selected').text();
        if(selected_object == 'Shot')
        {
            task_name = 'sq'
            $select_elem = $('#selectSequenceRange');
	    $select_elem.data('chosen').destroy().chosen();
            $("#selectEntitySequence option").each(function()
            {
                $select_elem.append('<option value="'+$(this).val()+'">'+ $(this).text()+'</>')
                $select_elem.trigger("chosen:updated");
                $select_elem.trigger("liszt:updated");
            });
            $('#createShot').show();
            $('#createSequence').hide();
            $('#demo').hide();
            $('#sequence').css({'visibility': ''});

            $('#div_x_range').show();
            $('#select_x_range').data("chosen").destroy().chosen();
        }
        if(selected_object == 'Sequence')
        {
            task_name = 'sq'
            var x_range = '1'
            $select_elem = $('#selectShotRange');
            //get range
            get_ranges(task_name, x_range, $select_elem)
            $('#shot').css({'visibility': ''});
            $('#selectSequenceRange_chosen').hide();
            $('#lable_id').text("")
            $('#createShot').hide();
            $('#createSequence').show();
            $('#demo').hide();
            $('#sequence').css({'visibility': ''});

            $('#select_x_range').trigger("liszt:updated");
            $('#select_x_range').trigger("chosen:updated");
            $('#div_x_range').hide();
        }
        if(selected_object == 'Asset Build')
        {
            if(!$('#selectEntityAssetType').val()){
                alert("Select Asset Type.");
                $('#create').attr('checked',false);
                $('#create_sq_sc').hide();
                return null;
            }
            $('#demo').show();
            $('#sequence').css({'visibility': 'hidden'});
            $('#shot').css({'visibility': 'hidden'});
            $('#msg').hide()
            $('#asst_name').val("");
            $('#asset_description').val("");
            $('#addAsset').css({'disabled': 'disabled'});
            $('#div_x_range').hide();

        }
	}
	else{
            $select_elem = $('#selectSequenceRange');
            $select_elem.empty();
            $select_elem.append('<option value="">Select</option>');
            $select_elem.trigger("chosen:updated");
            $select_elem.trigger("liszt:updated");

            $select_elem01 = $('#selectShotRange');
            $select_elem01.empty();
            $select_elem01.append('<option value="">Select</option>');
            $select_elem01.trigger("chosen:updated");
            $('#shot').css({'visibility': 'hidden'});
             $('#create_sq_sc').css({'visibility': 'hidden'});

            $select_elem02 = $('#selectEndShotRange');
            $select_elem02.empty();
            $select_elem02.append('<option value="">Select</option>');
            $select_elem02.trigger("chosen:updated");

            $select_elem03 = $('#selectShotType');
            $select_elem03.empty();
            $select_elem03.trigger("chosen:updated");
            $('#shot_type').hide()
            $('#create_sq_sc').hide();
            $('#selectSequenceRange_chosen').show();
            $('#lable_id').text("Shot : ")
            $('#div_x_range').hide();
        }
});

// Change selectSequenceRange
$("#selectSequenceRange").change(function(){
        var project_name = $('#selectEntityProject option:selected').text();
        var sequence_range = $(this).val();
        if(sequence_range)
        {
            task_name = 'sc'
            var x_range = $('#select_x_range').val();
            $select_elem = $('#selectShotRange');
            get_ranges(task_name, x_range, $select_elem);
            $('#shot').css({'visibility': ''});
        }
		else{
            $select_elem = $('#selectShotRange');
            $select_elem.empty();
            $select_elem.append('<option value="">Select</option>');
            $select_elem.trigger("chosen:updated");
            $select_elem.trigger("liszt:updated");
            $('#shot').css({'visibility': 'hidden'});
        }
});
// get range
function get_ranges(task_name, x_range, $select_elem){
    var project = $('#selectEntityProject option:selected').val();
    //call
    $.ajax({
            type:"POST",
            url:"/callajax/",
            data: {'project': project ,'object_name': 'Get Range', 'task_name' : task_name , 'x_range': x_range},
            beforeSend: function(){
                $select_elem.empty();
                $select_elem.append('<option value="">-- Select --</option>');
            },
            success: function(json){
                $.each(json, function (idx, obj) {
                    $select_elem.append('<option value="'+obj+'">' + obj + '</option>');
                });
                $select_elem.trigger("chosen:updated");
                $select_elem.trigger("liszt:updated");
		$select_elem.data('chosen').destroy().chosen();
            },
            error: function(error){
                console.log("Error:" + error);
            }
        });

}

// Change start frame
function get_endframe_range(id, value){
        var project_name = $('#selectEntityProject option:selected').text();
        var selected_stf = value;
        if(selected_stf)
        {
            task_name = 'sc'
            $select_elem = $('#selectEndFrame');
            //call
            stf_array = []
            $("#selectStartFrame option").each(function()
            {
                stf_array.push($(this).val());
            });
            sel_index = stf_array.indexOf(selected_stf);
            $select_elem.empty();
            for(i=sel_index; i<stf_array.length; i++){
                if(i == sel_index+1){
                    $select_elem.append('<option value="'+stf_array[i]+'" selected>'+stf_array[i]+'</option>');
                }
                else{
                    $select_elem.append('<option value="'+stf_array[i]+'">'+stf_array[i]+'</option>');
                }
            }

            $select_elem.trigger("chosen:updated");
            $select_elem.trigger("liszt:updated");
        }
		else{
            $select_elem = $('#selectEndFrame');
            $select_elem.empty();
            $select_elem.append('<option value="">Select</option>');
            $select_elem.trigger("chosen:updated");
            $select_elem.trigger("liszt:updated");
        }

}

// For display all shots
$("#all_entity_shots").click(function(){
    if (this.checked){
        $('#selectEntityShot option').prop('selected', true);
        $('#selectEntityShot').trigger('chosen:updated');
        var project_name = $('#selectEntityProject option:selected').text();
        var selected_object = $('#selectEntityObject').val();
        var selected_task = $('#selectEntityTask').val();
        var selectedValues = []
        $("#selectEntityShot option").each(function()
            {
               selectedValues.push($(this).val());
            });
        if(!selected_task){
            return null
        }
        if(selectedValues.length == 0){
            $('#all_entity_shots').prop('checked', false);
            return null
        }

        load_entity_tasks(selectedValues, project_name, selected_object, selected_task);
    }else{
        $('#example tfoot').empty();
        $("#selectEntityShot option:selected").prop("selected", false);
        $('#selectEntityShot').trigger('chosen:updated');
	}
});

// For display all sequence
$("#all_entity_sequences").click(function(){
    if (this.checked){
        $('#selectEntitySequence option').prop('selected', true);
        $('#selectEntitySequence').trigger('chosen:updated');
        var project_name = $('#selectEntityProject option:selected').text();
        var selected_object = $('#selectEntityObject').val();
        var selected_task = $('#selectEntityTask').val();
        var selectedValues = []
        $("#selectEntitySequence option").each(function()
            {
               selectedValues.push($(this).val());
            });
        if(!selected_task){
            return null
        }
        load_entity_tasks(selectedValues, project_name, selected_object, selected_task);
    }else{
        $('#example tfoot').empty();
        $("#selectEntityShot option:selected").prop("selected", false);
        $('#selectEntityShot').trigger('chosen:updated');
        $("#selectEntitySequence option:selected").prop("selected", false);
        $('#selectEntitySequence').trigger('chosen:updated');
	}
});

// Change shot range frame
$("#selectShotRange").change(function(){
        var project_name = $('#selectEntityProject option:selected').text();
        var selected_stf = $(this).val();
        if(selected_stf)
        {
            task_name = 'sc'
            $select_elem = $('#selectEndShotRange');
            //call
            stf_array = []
            $("#selectShotRange option").each(function()
            {
                stf_array.push($(this).val());
            });
            sel_index = stf_array.indexOf(selected_stf);
            $select_elem.empty();
            $select_elem.append('<option value="">Select</option>');
            for(i=sel_index; i<stf_array.length; i++){
                $select_elem.append('<option value="'+stf_array[i]+'">'+stf_array[i]+'</option>');
            }
            $select_elem.trigger("chosen:updated");
            $select_elem.trigger("liszt:updated");
	    $select_elem.data('chosen').destroy().chosen();
            $('#shot_type').hide()
            $("#selectShotType option:selected").prop("selected", false);
        }
		else{
            $select_elem = $('#selectEndShotRange');
            $select_elem.empty();
            $select_elem.append('<option value="">Select</option>');
            $select_elem.trigger("chosen:updated");
            $select_elem.trigger("liszt:updated");
	    $select_elem.data('chosen').destroy().chosen();
            $('#shot_type').hide()
        }
});

// For select and reange
$("#selectEndShotRange").change(function(){
       var shot_start_range = $('#selectShotRange option:selected').val();
       var shot_end_range =  $('#selectEndShotRange option:selected').val();
       var selected_sequence =  $('#selectSequenceRange option:selected').val();
       if(shot_start_range == shot_end_range){
            var data_shots = $("#selectSequenceRange option:selected").attr('data-shots')
            var data_shots_array = data_shots.split(",");
            var type = "abcdefghijklmnopqrstuvwxyz".split("");
            $("#selectShotType").empty();
            $("#selectShotType").append('<option value="">Type</option>');
            for(i=0; i< type.length; i++){
                var search_name = shot_start_range + type[i]
                index = data_shots.indexOf(search_name);
                if(index == -1){
                   $("#selectShotType").append('<option value="'+type[i]+'">'+type[i]+'</option>');
                   $("#selectShotType").trigger("chosen:updated");
                   $("#selectShotType").trigger("liszt:updated");
                }
            }
            $('#shot_type').show()
            $("#selectShotType option:selected").prop("selected", false);
	    $("#selectShotType").data('chosen').destroy().chosen();
       }
       else{
            $("#selectShotType option:selected").prop("selected", false);
            $('#shot_type').hide()
       }
});

// create short
$("#createShot").click(function(){
    var page = $('#task_menu1').find('li.active').first('a span').text().trim()
    var project_id = $('#selectEntityProject').val();
    var project_name = $('#selectEntityProject option:selected').text();
    var selected_task = $('#selectEntityTask').val();
    var entity_name = 'Shot'
    var parent_object = 'Sequence'
    var shot_start_range = $('#selectShotRange option:selected').val();
    var shot_end_range =  $('#selectEndShotRange option:selected').val();
    var shot_type = $('#shot_type option:selected').val();
    var shot_name = ''
    var parent_id = $("#selectSequenceRange").val();
    var parent_name = $("#selectSequenceRange option:selected").text();
    var description = 'new  created'
    var shot_create_type = 'Dynamic Shot'
    var creat_array = []
    var skip_array = []
    if(!shot_start_range){
        alert("select shot range!");
        return null;
    }
    if(!parent_id){
        alert("select sequence!");
        return null;
    }
    // for checking duplicate shots
    seq_array = [];
//    current_shots = $("#selectSequenceRange").find("option[value=" + parent_id +"]").attr('data-shots');
//    current_sht_array = current_shots.split(",");
    $("#selectShotRange option").each(function()
    {
        seq_array.push($(this).val());
    });
    st_index = seq_array.indexOf(shot_start_range);
    ed_index = seq_array.indexOf(shot_end_range);
    //-----
    if(shot_start_range == shot_end_range){
            shot_create_type = 'Static Shot'
            s = shot_start_range
            if(shot_type)
            {
             s = s + shot_type
            }
//            elm = current_sht_array.indexOf(s);
//            if(elm != -1){
//                alert("Shot " + s +" already created!")
//                return null
//            }
//            else{
                creat_array.push(s)
//            }
    }
    else{
        for(i=st_index; i<= ed_index; i++){
//            elm = current_sht_array.indexOf(seq_array[i]);
//            if(elm != -1){
                //alert("Shots between range " +shot_start_range+ " to " + shot_end_range +" already created!")
                //return null
//                skip_array.push(seq_array[i])
//                console.log("Shots between range " +shot_start_range+ " to " + shot_end_range +" already created!")

//            }
//            else{
                creat_array.push(seq_array[i])
//            }
        }
//        if(skip_array.length > 1){
//            alert("Shots " +skip_array+ " already created and will be skip!")
//        }
    }
    data_list = []
    task_data_list = []
    ssr_array = []
    $("#selectShotRange option").each(function()
    {
        ssr_array.push($(this).val());
    });
    if(!shot_end_range){
        shot_end_range = shot_start_range;
    }
    sel_st_index = ssr_array.indexOf(shot_start_range);
    sel_en_index = ssr_array.indexOf(shot_end_range);

    for(i=0; i< creat_array.length; i++){
        data_dict = {}
        if(shot_type){
        shot_name = creat_array[i]
        }
        else{
            shot_name = creat_array[i];
        }
        data_dict['shot_name'] = shot_name;
        data_dict['shot_create_type'] = shot_create_type;
        data_dict['entity_name'] = entity_name;
        data_dict['parent_id'] = parent_id;
        data_dict['parent_object'] = parent_object;
        data_dict['description'] = description;
        data_dict['project_id'] = project_id;
        data_dict['project_name'] = project_name;
        data_dict['page'] = page;
        var path = project_name + ':' + parent_name + ':' + shot_name;
        data_dict['path'] = path;
        data_list.push(data_dict);
    }
    update_form_data(project_name, entity_name, data_list, 'Shot');
});

//create   Sequence
$("#createSequence").click(function(){
    var page = $('#task_menu1').find('li.active').first('a span').text().trim();
    var project_id = $('#selectEntityProject').val();
    var project_name = $('#selectEntityProject option:selected').text();
    var entity_name = 'Sequence'
    var parent_object = 'Project'
    var shot_start_range = $('#selectShotRange option:selected').val();
    var shot_end_range =  $('#selectEndShotRange option:selected').val();
    var shot_type = $('#shot_type option:selected').val();
    var shot_name = ''
    var creat_array = []
    var skip_array = []
    var parent_id = $("#selectEntityProject option:selected").val();
    var description = 'new sequence created'
    if(!shot_end_range){
        shot_end_range = shot_start_range;
    }
    if(!shot_start_range){
        alert("select sequence range!");
        return null;
    }
    var current_seq_array = [];
    seq_array = [];
    $("#selectEntitySequence option").each(function()
            {
                current_seq_array.push($(this).text());
            });
    $("#selectShotRange option").each(function()
    {
        seq_array.push($(this).val());
    });
    st_index = seq_array.indexOf(shot_start_range);
    ed_index = seq_array.indexOf(shot_end_range);

    if(shot_start_range == shot_end_range){
            s = shot_start_range
            if(shot_type)
            {
             s = s + shot_type
            }
            elm = current_seq_array.indexOf(s);
            if(elm != -1){
                alert("Sequence " + s +" already created!")
                return null

            }else{
                creat_array.push(s)
            }
    }
    else{
        for(i=st_index; i<= ed_index; i++){
            elm = current_seq_array.indexOf(seq_array[i]);
            if(elm != -1){
                //alert("Sequence between range " +shot_start_range+ " to " + shot_end_range +" already created!")
                //return null
                skip_array.push(seq_array[i])
            }
            else{
                creat_array.push(seq_array[i])
            }
        }
        if(skip_array.length > 1){
            alert("Sequence " +skip_array+ " already created and will be skip!")
        }
    }
    var data_list = []
    var task_data_list = []
    var ssr_array = []
    $("#selectShotRange option").each(function()
    {
        ssr_array.push($(this).val());
    });

    sel_st_index = ssr_array.indexOf(shot_start_range);
    sel_en_index = ssr_array.indexOf(shot_end_range);

    for(i=0; i < creat_array.length; i++){
        data_dict = {}
        if(shot_type){
            shot_name = creat_array[i]
        }
        else{
            shot_name = creat_array[i];
        }
        data_dict['seq_name'] = shot_name;
        data_dict['entity_name'] = entity_name;
        data_dict['parent_id'] = parent_id;
        data_dict['parent_object'] = parent_object;
        data_dict['description'] = description;
        data_dict['project_id'] = project_id;
        data_dict['project_name'] = project_name;
        data_dict['page'] = page;
        data_dict['action'] = 'add';
        var path = project_name + ':' + shot_name;
        data_dict['path'] = path;
        data_list.push(data_dict)
    }
    update_form_data(project_name, entity_name, data_list, 'Sequence');
});


// For multiple rows edid
function RowClick(currenttr, lock, event) {
    if (event.ctrlKey) {
        var cur_id = $(currenttr).attr('id');
        var tr_clone = $('#'+cur_id).html();
        if(!$(currenttr).attr('org-data')){
            $(currenttr).attr('org-data', tr_clone);
        }
        toggleRow(currenttr);
        var selected_tr = $('#example tfoot').attr('data-selected-tr');
        var tr_array = []
        if(selected_tr){
            tr_array = selected_tr.split(",");
        }
        var index = tr_array.indexOf(cur_id);
        var tr_ids = $('#save').val();
        tr_ids_array = tr_ids.split(",");
        if(index == -1 && tr_ids_array.indexOf(cur_id) == -1){
            tr_array.push(cur_id)
        }else{
            tr_array.splice(index, 1);
        }
        $('#example tfoot').attr('data-selected-tr', tr_array);
        $('#reset').show();
    }
}

function toggleRow(row) {
    row.className = row.className == 'selected_tr' ? '' : 'selected_tr';
    lastSelectedRow = row;
}

function clearAll() {
    var trs = $('#example tfoot tr');
    for (var i = 0; i < trs.length; i++) {
        trs[i].className = 'selected_tr' ? '' : '';
    }
    $('#reset').hide();
}
// For create asset from CSV show
$("#add_asset_csv").click(function(){
    if (this.checked){
        $("#addAsset").attr("disabled", true);
        $("#addAssetFromCSV").show();
        var parent_id = $('#selectEntityProject').val();
        set_parent_id(parent_id);
        set_parent_object('Project');
	set_project_name(parent_id);	
    }
    else{
        $("#addAsset").attr("disabled", false);
        $("#addAssetFromCSV").hide();
    }
});

//For show asset create from csv modal in show_task_entity page
$("#addAssetFromCSV").click(function(){
    clear_asset_modal_fields();
    $("#assetModal").modal('toggle');
    $("#attached_csv_file").empty();
    $("#csv_asset_builds tbody").empty();
});

// For  add asset csv file from show_task_entity page
$('#add_asset_build_csv').click(function(){
    var page = $('#task_menu1').find('li.active').first('a span').text().trim();
    var project_name = $('#selectEntityProject option:selected').text();
    var asset_build_type = $('#selectEntityAssetType').val();
	var entity_name = "AssetBuild"
	var desc = 'New Asset Created'
	var parent_id = $('#selectEntityProject').val();

    var data_list = [];
    $("#csv_asset_builds tr[data-invalid='0']").each(function(index){
	td_array = {};
	var asset_build_name = $(this).find('td:eq(0)').text().trim();
	td_array['parent_id'] = parent_id;
	td_array['entity_name'] = entity_name
	td_array['parent_object'] = "Project"
	td_array['asset_build_name'] = asset_build_name;
	td_array['asset_build_type'] = asset_build_type;
	td_array['description'] = desc;
	td_array['action'] = 'add';
	td_array['project_name'] = project_name
	td_array['page'] = page
	var path = project_name + ':' + asset_name
	td_array['path'] = path
	data_list.push(td_array);
    });
    if (data_list.length > 0)
	var entity_name = 'AssetBuild';
	update_form_data(project_name, entity_name, data_list, "AssetBuild"); // save assets
	$('#table_view').empty();

	$('#assetModal').modal('hide');
	clear_asset_modal_fields();
});

// For show asset link modal
function show_entity_link_model(param){
    var asset_ids = [];
    var parent_id = $(param).closest('tr').attr('data-task-parent-id');
    var parent_path = $(param).closest('tr').find("td:eq(0)").text();
    var selected_object = $('#selectEntityObject').val();
    var prj_name = $("#selectEntityProject option:selected").text();
    $('#entity_loader').show();
    $.ajax({
	type: "POST",
	url:"/callajax/",
	data: { 'parent_id': parent_id , 'type_name': selected_object, 'object_name': 'Show Link Details' , 'last_row' : 15, 'project': prj_name},
	beforeSend: function(){

	    },
	success: function(json){
        $.each(json, function (idx, obj) {
            asset_ids.push(obj.id)
        });
        $('#myInput').val('');
        get_asset_list(prj_name, asset_ids)
        $('#save_asset').attr('old-ids', "")
        $('#save_asset').attr('old-ids', asset_ids)
        $('#save_asset').attr('task-id', parent_id)
        $('#save_asset').attr('parent_path', parent_path)
    },
    error: function(error){
        console.log("Error:\n" + error);
    }
    });
};

// For check all asset link model list
$("#all_link").click(function(){
    if (this.checked){
        $('input[name=asset]').prop('checked', true);
    }else{
        $('input[name=asset]').prop('checked', false);
    }
});
// For reset asset link model list
$("#reset_link_asset").click(function(){
    var cur_assets = $('#myList').attr('data-checked');
    var cur_assets_array = ''
    if(cur_assets){
        cur_assets_array = cur_assets.split(',');
        $.each($('input[name=asset]'), function(){
            ind = cur_assets_array.indexOf($(this).val());
            if(ind == -1){
                $(this).prop('checked', false);
            }else{
                $(this).prop('checked', true);
            }
         });
    $('#all_link').prop('checked', false);
    }
    else{
        $('input[name=asset]').prop('checked', false);
        $('#all_link').prop('checked', false);
    }
});

$("#select_x_range").change(function(){
    var task_name = 'sc'
    var $select_elem = $('#selectShotRange');
    var x_range = $(this).val();
    //get range
    get_ranges(task_name, x_range, $select_elem);
});


$("#show_sequence_delivery").click(function(){
      sequence_delivery_details();
  });

function sequence_delivery_details(){

    project = $('#selectDashProject').val();
    if(!project){
            error_message("Please select valid project");
            return false;
    }
    duration = $('#sequence_date_wise span').html();
    if(!duration){
            error_message("Please select valid duration");
    }

    dur_arr = duration.split(':');

    first = dur_arr[0];
    last = dur_arr[1];
    // call
    $.ajax({
        type: "POST",
        url: "/callajax/",
        data : {'object_name': 'Sequence Delivery', 'project': project, 'duration': duration,
        'first': first, 'last': last},
        beforeSend: function(){
            $("#summary_display").empty();
            $("#add_accordion").empty();
            $('#panel_big').plainOverlay('show');
        },
        success: function(json){
            summary = json['summary'];
            display_summary(summary);
            sequence_details(json);
            $('#panel_big').plainOverlay('hide');
        }
    });
}

function display_summary(summary){

    var table_data = table_creation("summary");
    $("#summary_display").append(table_data);

    $.each(summary, function(task_name, status_dict){
        var tr = $("<tr>");
        tr.append('<td>' + task_name+'</td>');
        tr.append('<td>' + parseFloat(status_dict.IA / 60).toFixed(2)+'</td>');
        tr.append('<td>' + parseFloat(status_dict.CA / 60).toFixed(2)+'</td>');
        tr.append('<td>' + parseFloat(status_dict.WIP / 60).toFixed(2)+'</td>');
        tr.append('<td>' + parseFloat(status_dict.PA / 60).toFixed(2)+'</td>');
        tr.append('<td>' + parseFloat(status_dict.CR / 60).toFixed(2)+'</td>');
        $("#example_summary tbody").append(tr);
    });

}

function table_creation(sequence_name){

    var id = 'example_'+sequence_name;
    var table_create = "<table id='"+id+"' class='table-bordered table-condensed' style='margin-top:10px;'>"+
    "<h4>"+sequence_name+"</h4><thead><tr>"+
    "<th>Task Name</th><th style='background-color:#76d7c4;color:black;'>IA (Min)</th>"+
    "<th style='background-color:#02ffcd;color:black;'>CA (Min) </th>"+
    "<th style='background-color:#3498db;color:black;'>WIP (Min)</th>"+
    "<th style='background-color:#ffab00;color:black;'>PA (Min)</th>"+
    "<th style='background-color:#c0392b;color:black;'>CR (Min)</th></tr></thead><tbody></tbody></table>";

    return table_create;
}
var cnt = 0;
function create_accordion(sequence_name, task_dict){
    var id = 'accordion_'+sequence_name;
    if(cnt == 0){
        accordion_data = "<div class='col-xs-3'><div class='thumbnail'><div class='panel-group' id='"+id+"'>"+
        "<div class='panel panel-default'><div class='panel-heading' style='background-color:rgba(0,0,0,0);'>"+
        "<h4 class='panel-title'>"+
        "<a data-toggle='collapse' data-parent='"+id+"' href='#"+sequence_name+"'>"+sequence_name+"</a></h4></div>"+
        "<div id='"+sequence_name+"' class='panel-collapse collapse'>"+
        "<div class='container'><strong>Total Sequence Duration (Minutes) &nbsp;&nbsp;&nbsp;"+
        task_dict.total_time+"</strong></div>"+
        "</div></div></div></div>";
        $("#add_accordion").append(accordion_data);
        cnt ++;
    }
    else{
        accordion_data = "<div class='col-xs-3'><div class='thumbnail'><div class='panel-group' id='"+id+"'>"+
        "<div class='panel panel-default'><div class='panel-heading' style='background-color:rgba(0,0,0,0);'>"+
        "<h4 class='panel-title'>"+
        "<a data-toggle='collapse' data-parent='"+id+"' href='#"+sequence_name+"'>"+sequence_name+"</a></h4></div>"+
        "<div id='"+sequence_name+"' class='panel-collapse collapse'>"+
        "<div class='container'><strong>Total Sequence Duration (Minutes) &nbsp;&nbsp;&nbsp;"+
        task_dict.total_time+"</strong></div>"+
        "</div></div></div></div>";
        $("#add_accordion").append(accordion_data);
    }
}
function sequence_details(json){

    $.each(json, function(sequence_name, task_dict){
        if (sequence_name != 'summary'){
            create_accordion(sequence_name, task_dict);
            var table_data = table_creation(sequence_name);
            $("#add_accordion div #"+sequence_name).append(table_data);

            $.each(task_dict, function(task_name, status_dict){
                tr = $("<tr>");
                if(task_name != 'total_time'){
                    tr.append("<td>"+task_name+"</td>");

                    if(status_dict.IA.total_secs != 0){
                        var table = tr_html_data(status_dict.IA.shot_details);
                        tr.append('<td onclick="sequence_shot_details(\''+table+'\')">'+
                        status_dict.IA.total_minutes+"</td>");
                    }
                    else
                        tr.append("<td>"+status_dict.IA.total_secs+"</td>");

                    if(status_dict.CA.total_secs != 0){
                       var table = tr_html_data(status_dict.CA.shot_details);
                        tr.append('<td onclick="sequence_shot_details(\''+table+'\')">'+
                        status_dict.CA.total_minutes+"</td>");
                    }
                    else
                        tr.append("<td>"+status_dict.CA.total_secs+"</td>");
                    if(status_dict.WIP.total_secs != 0){
                        var table = tr_html_data(status_dict.WIP.shot_details);
                        tr.append('<td onclick="sequence_shot_details(\''+table+'\')">'
                        +status_dict.WIP.total_minutes+"</td>");
                    }
                    else
                        tr.append("<td>"+status_dict.WIP.total_secs+"</td>");

                    if(status_dict.PA.total_secs != 0){
                        var table = tr_html_data(status_dict.PA.shot_details);
                        tr.append('<td onclick="sequence_shot_details(\''+table+'\')">'
                        +status_dict.WIP.total_minutes+"</td>");
                    }
                    else
                        tr.append("<td>"+status_dict.PA.total_secs+"</td>");
                    if(status_dict.CR.total_secs != 0){
                        var table = tr_html_data(status_dict.CR.shot_details);
                        tr.append('<td onclick="sequence_shot_details(\''+table+'\')">'
                        +status_dict.CR.total_minutes+"</td>");
                    }
                    else
                        tr.append("<td>"+status_dict.CR.total_secs+"</td>");

                    $("#example_"+sequence_name+" tbody").append(tr);
                }
            });
        }

    });
}
/*
    in this function
    html tr data is generated
    and returned
*/
function tr_html_data(data){
    var table = '';

    $.each(data, function(i, v){
        var tr = '<tr><td>' + v.shot_name + '</td>';
        tr += '<td>' + v.total + '</td></tr>';
        table += tr;
    });
   return table;
}
function sequence_shot_details(tr_data){
    $("#modal_data").html('');
    var s = '<table id="shot_details" style="width:100%"'+
    'class="table-hover table-condensed table-bordered"><thead>'+
    '<tr><th>Shot Names</th><th>Total Time (seconds)</th></tr></thead><tbody></tbody></table>';

    $("#modal_data").append(s);

    $("#shot_details tbody").append(tr_data);

    $("#myModal").modal("show");
}

function console_log(obj){
    str_data = JSON.stringify(obj);
}

function create_datatable(table_id){
    
        var table = $('#'+table_id).DataTable({
                scrollY:570,
                "lengthMenu": [[20, 40, 50, 100], [20, 40, 50, 100]],
                fixedHeader:{
                    header: true
                }
        });
        set_table_header(table);
        $(".dataTables_filter label input").css("background-color", "#444");
        $(".dataTables_filter label input").css("height", "18px");
        $(".dataTables_filter label input").attr("placeholder","Type to search ...");
        $(".dataTables_filter label input").addClass("x-form-field x-form-text x-form-empty-field");
        $(".dataTables_filter label").css("color", "lightgrey");
        $(".dataTables_length label").css("color", "lightgrey");
        $(".dataTables_length select").css("background-color", "#444");
        $(".dataTables_length select").addClass("input-sm");
        $(".dataTables_info").css("color", "#fff");
}
//---------------------------------------------------------------------------//
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
    if ($('#create_roles').attr('class') == 'active'){
         show_role_pages();
    }
    if ($('#update_users').attr('class') == 'active'){
	create_datatable('tbl_users');
    }
    if ($('#review_tasks').attr('class') == 'active'){
        show_review_tasks();
    }
    if($('#create_entities').attr('class') == 'active'){
        get_project_details();
    }
    if($('#artist_productivity_reports').attr('class') == 'active'){
        artist_productivity();
    }
    if($('#month_wise_reports').attr('class') == 'active'){
        month_wise_reports();
    }
    if($("#sequence_delivery").attr('class') == 'active'){
        sequence_delivery_details();
    }
}

