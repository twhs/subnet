// グローバル変数
var all_1_bit = ntoi('255.255.255.255');
var colors = [
    '#2d8587',
    '#cddb94',
    '#87c2d7',
    '#113311',
    '#f3e8f7',
];

/*
 * メイン関数
 * */
function main() {
    //計算ボタンクリック時の動作を submitbutton に定義
    $('#submitbutton').click(clickCalc);
    //クリアボタンの動作を定義
    $('#clear-button').click(function(){
        $('#calc-subnet').empty();
        $('#subnet-list').empty();
        $('#memo-address').empty();
        var canvas = $("#pieChart");
        var ctx = $("#pieChart").get(0).getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
}

// 「計算」を押した時の動作を定義
function clickCalc() {
    // 入力された IP アドレスを取得
    var ip_pref = $('#ip').val().split('/');
    // IP アドレス
    var ip_addr = ip_pref[0];
    // プレフィクス
    var prefix = ip_pref[1];
    // サブネット数を計算
    var subnet_num = 32 - prefix - 2;
    // 分割するアドレスを表示
    var h2 = $('<h2>', {id:'main-ip',text:ip_addr + '/' + prefix});
    var input_number = $('<input>',{type: 'number',id:'input_number', min:0 , max: subnet_num});
    $('#calc-subnet').empty();
    h2.append(input_number);
    $('#calc-subnet').append(h2);
    // 分割数入力欄のクリック時の動作
    $('#input_number').click(clickSubnetIn);
}

// 分割数入力欄をクリックした時の処理
function clickSubnetIn() {
    // 初期化処理
    $('#subnet-list').empty();
    var main_ip = $('#main-ip').text().split('/');
    var ip_addr = main_ip[0];
    var before_pref = parseInt(main_ip[1]);
    var after_pref = parseInt($('#input_number').val()) + before_pref;
    // サブネットを計算
    var subnets = calcSubnet(ip_addr, before_pref, after_pref);
    // 各サブネットをリストで表示 & グラフ用データ作成
    var s = '';
    var graph_data = [];
    // サブネットを格納する table を作成
    var trh = $('<tr>');
    var th_network = $('<th>', {scope:"row", text:"ネットワークアドレス"});
    var th_startip = $('<th>', {scope:"row", text:"開始 IP アドレス"});
    var th_endip = $('<th>', {scope:"row", text:"終了 IP アドレス"});
    var th_use = $('<th>');
    var th_subnet = $('<th>');
    trh.append(th_network, th_startip, th_endip, th_use, th_subnet);
    $("#subnet-list").append(trh);
    for (var i=0; i < subnets.length; ++i) {
        s = subnets[i];
        graph_data.push({value:100/subnets.length,color:colors[i % colors.length]});
        // td 要素に追加する button 要素作成
        var use_button = $('<input>', 
                {
                    class:'use_button btn btn-primary',
                    type:'button',
                    value:'使用',
                });
        var subnet_button = $('<input>', 
                {
                    class:'subnet_button btn btn-info',
                    type:'button',
                    value:'サブネット',
                });
        // table に格納
        var tr = $('<tr>');
        var td_network = $('<td>', {text:s.network_addr});
        var td_startip = $('<td>', {text:s.start_ip});
        var td_endip = $('<td>', {text:s.end_ip});
        var td_use = $('<td>').append(use_button);
        var td_subnet = $('<td>').append(subnet_button);
        // DOM に追加
        tr.append(td_network, td_startip, td_endip, td_use, td_subnet);
        $("#subnet-list").append(tr);
    }
    // table 要素内のボタンを押した時の動作を指定
    $('.use_button').click(clickUseButton);
    $('.subnet_button').click(clickSubnetButton);
    // 円グラフ作成
    createChart(graph_data);
}

// 使用ボタンクリック時の動作を定義
function clickUseButton(event) {
    //メモ欄に追加するアドレス範囲を取得
    var tr = $(event.currentTarget).closest('tr')[0];
    var start_ip = $(tr.cells[1]).text();
    var end_ip = $(tr.cells[2]).text();
    var use_ip_range = start_ip + ' - ' + end_ip ;
    //メモ欄に追加
    $('#memo-address').append(use_ip_range + '\n');
    //ボタンを無効化
    $(event.target).attr('disabled',true);
    $(event.currentTarget).closest('button').attr('disabled', true);
}

// サブネットボタンクリック時の動作
function clickSubnetButton(event) {
   // サブネットするネットワークアドレスを取得
   var tr = $(event.currentTarget).closest('tr')[0];
   var tmp_addr = $(tr.cells[0]).text().split('/');
   var network_addr = tmp_addr[0];
   var prefix = tmp_addr[1];
   // 現在表示しているものをクリア
   $('#subnet-list').empty();
   $('#calc-subnet').empty();
   clearCanvas();
   // フォームを追加
   var subnet_num = 32 - prefix - 2;
   // 分割するアドレスを表示
   var h2 = $('<h2>', {id:'main-ip',text:network_addr + '/' + prefix});
   var input_number = $('<input>',{type: 'number',id:'input_number', min:0 , max: subnet_num});
   h2.append(input_number);
   $('#calc-subnet').append(h2);
   // 分割数入力欄のクリック時の動作
   $('#input_number').click(clickSubnetIn);
}

// data を引数に円グラフを作成
function createChart(data) {
    var ctx = $("#pieChart").get(0).getContext("2d");
    var pieChart = new Chart(ctx).Pie(data);
}

// サブネットを計算
function calcSubnet(ip, before_pref, after_pref) {
    var subnets = [];
    // 文字列の IP アドレスを数値に変換
    var ip_addr_int = ntoi(ip);
    // サブネットの範囲で最大値となる IP アドレスを求める
    var max_ip_addr_in_subnets = ntoi(ip) | (Math.pow(2, after_pref - before_pref) - 1) << 32 - after_pref;
    // サブネットの増分値を求める
    var increment_param = 1 << 32 - after_pref;
    // サブネットを求める
    for (var s_ip = ip_addr_int; s_ip <= max_ip_addr_in_subnets ;s_ip += increment_param){
        subnets.push({
            'network_addr':iton(s_ip) + '/' + after_pref,
            'start_ip': iton(s_ip | 1) + '/' + after_pref, 
            'end_ip':iton(s_ip | Math.pow(2, 32 - after_pref) - 2) + '/' + after_pref
        });
    }

    return subnets;
}

// オクテット単位の IP アドレスを int 型の数値に変換
function ntoi(ip_addr_octet) {
    var octets = ip_addr_octet.split('.');
    // octets を数値に変換
    var ip_addr_int = 0;
    for (var i=0; i < octets.length; ++i) {
        ip_addr_int = ip_addr_int | (octets[i] << (24 - 8 * i));
    }

    return ip_addr_int;
}

// int 型の IP アドレスをオクテット単位の IP アドレスに変換
function iton(ip_addr_int) {
    var ip_addr_octet = '';
    var octets = [];
    //オクテット単位の文字列に変換
    for (var i=0; i < 4; ++i) {
        var tmp = (ip_addr_int >>> (24 - 8 * i)) >>> 0
        octets.push(tmp);
        ip_addr_int = ip_addr_int - (tmp << (24 - 8 * i));
    }

    return octets.join('.');
}

// ランダムな色コードを返す
function getColor() {
    // 0 ~ 99 のランダムな数値を生成
    var random_num = Math.floor(Math.random() * 100);

    return colors[random_num % colors.length];
}

// canvas 要素内のクリア
function clearCanvas() {
    var ctx = $("#pieChart").get(0).getContext("2d");
    var pieChart = "";
}

main();
