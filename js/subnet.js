// グローバル変数
var all_1_bit = ntoi('255.255.255.255');


/*
 * メイン関数
 * */
function main() {
    //計算ボタンクリック時の動作を submitbutton に定義
    $('#submitbutton').click(clickCalc);
    // デバッグ用
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
    for (var i=0; i < subnets.length; ++i) {
        s = subnets[i];
        graph_data.push({value:100/subnets.length,color:getColor()});
        // li 要素作成
        var li_text = s.start_ip + '〜' + s.end_ip;
        var li = $('<li>', {id:s.start_ip, text:li_text});
        // li 要素に追加する button 要素作成
        var use_button = $('<input>', 
                {
                    class:'use_button',
                    type:'button',
                    value:'使用',
                });
        var subnet_button = $('<input>', 
                {
                    class:'subnet_button',
                    type:'button',
                    value:'サブネット',
                });
        // DOM に追加
        li.append(use_button);
        li.append(subnet_button);
        $('#subnet-list').append(li)
    }
    // li 要素内のボタンを押した時の動作を指定
    $('.use_button').click(clickUseButton);
    $('.subnet_button').click(clickSubnetButton);
    // 円グラフ作成
    createChart(graph_data);
}

// 使用ボタンクリック時の動作を定義
function clickUseButton(event) {
    //メモ欄に追加するアドレス範囲を取得
    var target_ip_range = $(event.currentTarget).closest('li').text();
    //メモ欄に追加
    $('#memo-address').append(target_ip_range + '\n');
    //ボタンを無効化
    $(event.target).attr('disabled',true);
}

// サブネットボタンクリック時の動作
function clickSubnetButton() {
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
   return "#0000";
}

main();
