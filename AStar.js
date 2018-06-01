function main() {
    const canvas = document.getElementById('canvas');
    const map = canvas.getContext('2d');
    let i;
    let deadEnd = [];
    //黑名单列表,包括墙和已走过的格子
    const close = [];
    //一步(格子)的大小.0是第一格,step是第二格,step*2是第三格(canvasXY=400px)
    const step = 20;
    //绘制地图
    function drawMap(x, y) {
        for (i = 0; i <= map.canvas.width; i += x) {
            map.beginPath();//画一条路径
            map.moveTo(0, i);//开始路径位置
            map.lineTo(map.canvas.width, i);//结束路径位置
            map.stroke();//绘制路径(默认不显示)
        }
        for (i = 0; i <= map.canvas.height; i += y) {
            map.beginPath();
            map.moveTo(i, 0);
            map.lineTo(i, map.canvas.height);
            map.stroke();
        }
    }
    drawMap(step, step);
    //起点(绿色)
    let startX;
    let startY;
    let btnStart = document.getElementById('start');
    btnStart.onclick = function () {
        canvas.onclick = function (startEnd) {
            const e = startEnd || window.event;
            if (startX == null) {
                startX = step * (Math.floor((e.clientX - (window.outerWidth - canvas.clientWidth) / 2) / step));
                startY = step * (Math.floor((e.clientY - (window.outerHeight - canvas.clientHeight - 12) / 2) / step) + 2);
            }
            map.fillStyle = 'rgba(0,255,0,1.0)';
            map.fillRect(startX, startY, step, step);
        };
    };
    //终点(红色)
    let endX;
    let endY;
    let btnEnd = document.getElementById('end');
    btnEnd.onclick = function () {
        canvas.onclick = function (startEnd) {
            const e = startEnd || window.event;
            if (endX == null) {
                endX = step * (Math.floor((e.clientX - (window.outerWidth - canvas.clientWidth) / 2) / step));
                endY = step * (Math.floor((e.clientY - (window.outerHeight - canvas.clientHeight - 12) / 2) / step) + 2);
            }
            map.fillStyle = 'rgba(255,0,0,1.0)';
            map.fillRect(endX, endY, step, step);
        };
    };
    //障碍墙(黑色)
    let wallX;
    let wallY;
    let btnWall = document.getElementById('wall');
    btnWall.onclick = function () {
        canvas.onclick = function (startEnd) {
            const e = startEnd || window.event;
            wallX = (step * (Math.floor((e.clientX - (window.outerWidth - canvas.clientWidth) / 2) / step)));
            wallY = (step * (Math.floor((e.clientY - (window.outerHeight - canvas.clientHeight - 12) / 2) / step) + 2));
            if (wallX !== startX || wallY !== startY ) {
                if (wallX !== endX || wallY !== endY) {
                    map.fillStyle = 'rgba(0,0,0,1.0)';
                    map.fillRect(wallX, wallY, step, step);
                    //添加墙到close
                    close.push(wallX);
                    close.push(wallY);
                }
            }
        };
    };
    //开始寻路
    let btnGo = document.getElementById('go');
    btnGo.onclick = function () {
        navigate();
    };
    //清空数据(其实这就是一个刷新)
    let btnClear = document.getElementById('clear');
    btnClear.onclick = function () {
        location.reload();
    };
    //寻路方法
    function navigate() {
        //取得上下左右坐标
        const nextStep = [
            startX, startY - step,
            startX, startY + step,
            startX - step, startY,
            startX + step, startY,
            startX - step, startY - step,
            startX + step, startY + step,
            startX - step, startY + step,
            startX + step, startY - step,
        ];
        console.log(nextStep);
        //储存最小F的(初始值为画布宽)
        let minF = map.canvas.width * 5;
        //用于交换对比的F(初始值为格子大小)
        let minSwap = step;
        for (i = 0; i < nextStep.length; i += 2) {
            //判断minF的格子在不在close,是否超越地图
            for (let j = 0; j < close.length; j+=2) {
                if (nextStep[i] === close[j] && nextStep[i + 1] === close[j + 1] || nextStep[i] < 0 || nextStep[i+1] < 0) {
                    //如果在,则从候选nextStep中删除
                    nextStep.splice(i, 2);
                    //因为删了一个元素(一组坐标)所以要不能让i+2
                    i -= 2;
                }
            }
            //取得临时F(F=G+H)
            minSwap = (Math.abs((endX - nextStep[i])) + Math.abs((endY - nextStep[i + 1])));
            //判断是否更小
            //alert(minSwap + 'vvv' + minF);
            if (minSwap < minF) {
                minF = minSwap;
                //储存更小的作为下一步起点
                startX = nextStep[i];
                startY = nextStep[i + 1];
            }
        }
        //处理死胡同(临时解决方案,仍有bug)
        if (nextStep.length >= 4) {
            deadEnd[0] = startX;
            deadEnd[1] = startY;
        }
        if (nextStep.length===0){
            //回到上一个岔路
            startX = deadEnd[0];
            startY = deadEnd[1]-step;
        }
        //开始绘制下一步
        map.fillStyle = 'rgba(0,0,255,1.0)';
        //判断未到达终点就绘制路线
        if (minF >= step) {
            map.fillRect(startX, startY, step, step);
            //将走过路的提交到close
            close.push(startX, startY);
            //延迟递归
            setTimeout(navigate, 100);
        }
    }
};