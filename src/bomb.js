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
        var $tr, $td, $div;

        //clear
        $found.text(0);
        $time.text(0);
        $table.empty();
        clearInterval(interval);
        interval = undefined;
        $all.text(count);

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
            $div = getCell(
                Math.round(Math.random() * ($x.val() - 1)),
                Math.round(Math.random() * ($y.val() - 1))
            );
            if (!$div.data("bomb")) {
                $div.data("bomb", true);
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
        $table.find("div").mousedown(onCheck).click(onClick)
    }

    function getCell(x, y) {
        if (x < 0 || y < 0 || x > $x.val() - 1 || y > $y.val() - 1) return $();
        return $table.find("tr").eq(x).find("td").eq(y).find("div");
    }

    function onClick() {
        var time = parseInt($time.text());

        if ($(this).data("checked")) return;

        //timer
        if (!interval) {
            interval = setInterval(function () {
                $time.text(parseInt($time.text()) + 1);
                if (parseInt($time.text()) == 999) clearInterval(interval);
            }, 1000)
        }

        if ($(this).data("bomb")) {
            $table.find("div").unbind().filter(":data(bomb)").addClass("bomb");
            clearInterval(interval);
            if (confirm("Вы проиграли!!! Начать новую игру?")) restart();
            return;
        } else {
            neighbors($(this));
            $table.find("div").data("visited", false);
        }

        if ($table.find(":data(bomb)").length + $table.find(".no-bomb").length == $x.val() * $y.val()) {

            if (!bestTime() || time < bestTime()) bestTime(time);
            alert("Вы выиграли!!! Ваш результат " + time + " сек.");

            restart();
        }
    }

    function bestTime(value) {
        var key = $x.val() + "-" + $y.val() + "-" + $count.val();

        if (value === undefined) {
            return localStorage.getItem(key)
        } else {
            localStorage.setItem(key, value)
        }
    }

    function neighbors($cell) {
        var x = $cell.data("x");
        var y = $cell.data("y");
        var $cells = $([
            getCell(x + 1, y + 1), getCell(x + 1, y), getCell(x + 1, y - 1),
            getCell(x - 1, y + 1), getCell(x - 1, y), getCell(x - 1, y - 1),
            getCell(x    , y + 1), getCell(x    , y), getCell(x    , y - 1)
        ]).map(function () { return $(this).toArray(); });
        var count = $cells.filter(":data(bomb)").length;

        if ($cell.data("checked")) $found.text(parseInt($found.text() - 1));
        $cell.unbind().addClass("no-bomb").data("visited", true);

        if (count > 0) {
            $cell.text(count);
        } else {
            $cells.each(function () {
                if (!$(this).data("visited") && !$(this).data("bomb")) {
                    neighbors($(this));
                }
            });
        }
    }

    function onCheck(e) {
        var checked = $(this).data("checked");

        if (e.button != 2 || $(this).is(".no-bomb")) return;

        $(this).data("checked", !checked).toggleClass("undefined checked");
        $found.text($table.find(":data(checked)").length);
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

        restart();
    }).change();
});