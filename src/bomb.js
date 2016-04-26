$(function () {
    var $mode = $("#mode");
    var $x = $("#x");
    var $y = $("#y");
    var $count = $("#count");
    var $restart = $("#restart");
    var $table = $("#table");
    var $found = $("#found");
    var $all = $("#all");
    var $time = $("#time");
    var $best = $("#best");
    var $reset = $("#reset");
    var interval;

    function restart() {
        var count = Math.min($count.val(), $x.val() * $y.val());
        var $divForBomb;
        var $tr, $td;

        //clear
        $found.text(0);
        $time.text(0);
        $table.empty();
        clearInterval(interval);
        interval = undefined;

        //render table
        for (var i = 0; i < $x.val(); i++) {
            $tr = $("<tr>");
            for (var j = 0; j < $y.val(); j++) {
                $td = $("<td>").append($("<div>").data("x", i).data("y", j));
                $tr.append($td);
            }
            $table.append($tr);
        }

        //set bombs
        while (count > 0) {
            $divForBomb = getSell(
                Math.max(0, Math.round(Math.random() * $x.val()) - 1),
                Math.max(0, Math.round(Math.random() * $y.val()) - 1)
            );
            if (!$divForBomb.data("bomb")) {
                $divForBomb
                    .data("bomb", true)
                    .addClass("bomb")
                    /*.css("background-color", "red")*/; //for debug
                count--;
            }
        }

        //set best time
        if (bestTime()) {
            $best.text(bestTime());
        } else {
            $best.text(999);
        }

        //events
        $table.find("div")
            .mousedown(onCheck)
            .click(onClick)
    }

    function getSell(x, y) {
        if (x < 0 || y < 0 || x > $x.val() - 1 || y > $y.val() - 1) return null;
        return $table.find("tr").eq(x).find("td").eq(y).find("div");
    }

    function onClick() {
        var time = parseInt($time.text());

        if (!interval) {
            interval = setInterval(function () {
                $time.text(parseInt($time.text()) + 1);
                if (parseInt($time.text()) == 999) clearInterval(interval);
            }, 1000)
        }

        if ($(this).data("bomb")) {
            $table.find("div")
                .unbind("click", onClick)
                .unbind("mousedown", onCheck)
                .filter(".bomb").css("background-color", "red");
            clearInterval(interval);
            if (confirm("Вы проиграли!!! Начать новую игру?")) {
                restart();
            }
        } else {
            neighbors($(this));
        }

        if ($table.find("div.bomb").length + $table.find("div.no-bomb").length == $x.val() * $y.val()
            && $table.find("div.no-bomb").length) {

            if (!bestTime() || time < bestTime()) bestTime(time);
            alert("Вы выиграли!!! Ваш результат " + time + " сек.");

            restart();
        }
        $table.find("div").data("visited", false);
    }

    function bestTime(value) {
        var key = $x.val() + "-" + $y.val() + "-" + $count.val();

        if (value === undefined) {
            return localStorage.getItem(key)
        } else  {
            localStorage.setItem(key, value)
        }
    }

    function neighbors($sell) {
        var i;
        var x = $sell.data("x");
        var y = $sell.data("y");
        var sells = [
            getSell(x + 1, y + 1), getSell(x + 1, y), getSell(x + 1, y - 1),
            getSell(x - 1, y + 1), getSell(x - 1, y), getSell(x - 1, y - 1),
            getSell(x    , y + 1), getSell(x    , y), getSell(x    , y - 1)
        ];
        var count = 0;

        if ($sell.data("checked")) $found.text(parseInt($found.text() - 1));
        $sell
            .unbind("click")
            .addClass("no-bomb")
            .css("background-color", "white")
            .data("visited", true);

        for (i in sells) {
            if (sells[i] && sells[i].data("bomb")) count++;
        }

        if (count > 0) {
            $sell.text(count);
        } else {
            for (i in sells) {
                if (sells[i] && !sells[i].data("visited") && !sells[i].data("bomb")) {
                    neighbors(sells[i]);
                }
            }
        }
    }

    function onCheck(e) {
        if (e.button != 2) return;

        if ($(this).data("checked")) {
            $(this)
                .data("checked", false)
                .bind("click", onClick)
                .css("background-color", "gray");
            $found.text(parseInt($found.text() - 1));
        } else {
            $(this)
                .data("checked", true)
                .unbind("click", onClick)
                .css("background-color", "yellow");
            $found.text(parseInt($found.text()) + 1);
        }
    }

    $x.change(restart).hide();
    $y.change(restart).hide();
    $count.change(function () {
        $all.text($(this).val());
        restart();
    }).hide();
    $restart.click(restart);
    $table.bind("contextmenu", function () {
        return false;
    });
    $reset.click(function () {
        localStorage.clear();
        $best.text(999);
    });
    $mode.change(function () {
        var $selected = $(this).find("option:selected");

        if ($selected.val() == "custom") {
            $("input").show();
        } else {
            $("input").hide();
        }

        $x.val($selected.data("x"));
        $y.val($selected.data("y"));
        $count.val($selected.data("bombs"));
        $all.text($count.val());

        restart();
    }).change();
});