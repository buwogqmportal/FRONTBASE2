<script lang="ts">
  import { scaleLinear } from 'd3-scale';

  const points = [
    { day: 'M', req: 5 },
    { day: 'D', req: 16 },
    { day: 'M', req: 15 },
    { day: 'D', req: 6 },
    { day: 'F', req: 9 },
    { day: 'S', req: 10 },
    { day: 'S', req: 4 },
  ];

  const points_2 = [
    { day: 'M', req: 5 },
    { day: 'D', req: 18 },
    { day: 'M', req: 17 },
    { day: 'D', req: 8 },
    { day: 'F', req: 9 },
    { day: 'S', req: 13 },
    { day: 'S', req: 4 },
  ];

  const maxTick = 30;

  const yTicks = [0, maxTick * 0.5, maxTick];

  $: xScale = scaleLinear().domain([0, points.length]).range([0, innerWidth]);

  $: yMax = 60;
  $: yViewBox = yMax + 40;

  $: yScale = scaleLinear().domain([0, maxTick]).range([0, yMax]);

  let innerWidth = 0;
  $: barWidth = innerWidth / points.length;
</script>

<div bind:clientWidth={innerWidth}>
  <svg viewBox="0 0 {innerWidth} {yViewBox}">
    <!-- y axis -->
    <g>
      {#each yTicks as tick}
        <g transform="translate(0, {yScale(tick) + yMax / 4})">
          <line x1="0" x2="100%" class="stroke-current text-secondary-lighter" />
        </g>
      {/each}
    </g>

    <!-- x axis -->
    <g>
      {#each points as point, i}
        <g transform="translate({xScale(i) + barWidth / 2}, {yViewBox})">
          <text text-anchor="middle" class="fill-current text-secondary/70">{point.day}</text>
        </g>
      {/each}
    </g>

    <g>
      {#each points_2 as point, i}
        <rect
          x={xScale(i) + barWidth / 2 - 3}
          y={yScale(maxTick) - yScale(point.req) + yMax / 4}
          width="6"
          height={yScale(point.req)}
          rx="3"
          class="fill-current text-primary-light"
        />
      {/each}
      {#each points as point, i}
        <rect
          x={xScale(i) + barWidth / 2 - 3}
          y={yScale(maxTick) - yScale(point.req) + yMax / 4}
          width="6"
          height={yScale(point.req)}
          rx="3"
          class="fill-current text-primary"
        />
      {/each}
    </g>
  </svg>
</div>
