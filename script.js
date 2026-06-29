(() => {
  const svgNS = "http://www.w3.org/2000/svg"

  const trendData = {
    week: {
      axis: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
      values: [28, 36, 41, 57, 52, 68, 79],
      kpis: { events: "126", media: "94%", sync: "7" },
      summary: { journal: "18", offline: "7", media: "94%" },
      labels: [
        "Понедельник: 28 событий",
        "Вторник: 36 событий",
        "Среда: 41 событие",
        "Четверг: 57 событий",
        "Пятница: 52 события",
        "Суббота: 68 событий",
        "Воскресенье: 79 событий",
      ],
      notes: [
        "Понедельник начался спокойно: основная активность пришлась на утренние отметки.",
        "Во вторник выросло число подтверждений журнала на объектах.",
        "Среда показывает ровную смену без резких провалов по отметкам.",
        "В четверг заметно больше отчетов с фото и видео.",
        "Пятница держится рядом с пиком недели по рабочим событиям.",
        "В субботу выросла активность по объектам с ТО.",
        "Воскресенье: больше всего подтвержденных событий и отчетов с медиа.",
      ],
    },
    today: {
      axis: ["08", "10", "12", "14", "16", "18"],
      values: [3, 12, 26, 34, 42, 51],
      kpis: { events: "51", media: "88%", sync: "2" },
      summary: { journal: "6", offline: "2", media: "88%" },
      labels: ["08:00: 3 события", "10:00: 12 событий", "12:00: 26 событий", "14:00: 34 события", "16:00: 42 события", "18:00: 51 событие"],
      notes: [
        "Первые отметки пришли до начала основной смены.",
        "К 10:00 видна большая часть утреннего контроля.",
        "К середине дня отчеты и журналы начинают догонять присутствие.",
        "После 14:00 растет число подтвержденных работ по объектам.",
        "К 16:00 появляются новые отчеты с вложениями.",
        "К 18:00 смена выглядит собранной: осталось 2 события в ожидании связи.",
      ],
    },
    month: {
      axis: ["1", "5", "10", "15", "20", "25", "30"],
      values: [64, 88, 116, 131, 158, 183, 211],
      kpis: { events: "211", media: "91%", sync: "12" },
      summary: { journal: "46", offline: "12", media: "91%" },
      labels: ["1 число: 64 события", "5 число: 88 событий", "10 число: 116 событий", "15 число: 131 событие", "20 число: 158 событий", "25 число: 183 события", "30 число: 211 событий"],
      notes: [
        "Старт месяца показывает базовую нагрузку по объектам.",
        "К пятому числу виден рост ежедневных отметок.",
        "К десятому числу отчеты становятся стабильной частью контроля.",
        "Середина месяца проходит без провала по журналам.",
        "После двадцатого числа активность объектов заметно усиливается.",
        "К двадцать пятому числу растет доля отчетов с медиа.",
        "К концу месяца видно накопленную картину по присутствию, журналам и отчетам.",
      ],
    },
  }

  const trendWidget = document.querySelector("[data-trend-widget]")

  if (trendWidget) {
    const line = trendWidget.querySelector("[data-trend-line]")
    const area = trendWidget.querySelector("[data-trend-area]")
    const dots = trendWidget.querySelector("[data-trend-dots]")
    const axis = trendWidget.querySelector("[data-trend-axis]")
    const insight = trendWidget.querySelector("[data-trend-insight]")
    const rangeButtons = [...trendWidget.querySelectorAll("[data-range]")]
    const kpiNodes = {
      events: trendWidget.querySelector('[data-trend-kpi="events"]'),
      media: trendWidget.querySelector('[data-trend-kpi="media"]'),
      sync: trendWidget.querySelector('[data-trend-kpi="sync"]'),
    }
    const summaryNodes = {
      journal: trendWidget.querySelector('[data-trend-summary="journal"]'),
      offline: trendWidget.querySelector('[data-trend-summary="offline"]'),
      media: trendWidget.querySelector('[data-trend-summary="media"]'),
    }

    const chartBounds = { left: 42, right: 604, top: 44, bottom: 208 }

    const buildPoints = (values) => {
      const max = Math.max(...values) * 1.12
      const step = values.length === 1 ? 0 : (chartBounds.right - chartBounds.left) / (values.length - 1)

      return values.map((value, index) => ({
        value,
        x: chartBounds.left + step * index,
        y: chartBounds.bottom - (value / max) * (chartBounds.bottom - chartBounds.top),
      }))
    }

    const buildPath = (points) => points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ")

    const setActiveTrendPoint = (index, dataset) => {
      const pointNodes = [...dots.querySelectorAll(".trend-point")]
      pointNodes.forEach((point, pointIndex) => {
        const isActive = pointIndex === index
        point.classList.toggle("is-active", isActive)
        point.querySelector("circle")?.setAttribute("r", isActive ? "8" : "5.5")
      })

      if (insight) {
        insight.querySelector("strong").textContent = dataset.labels[index]
        insight.querySelector("span").textContent = dataset.notes[index]
      }
    }

    const renderTrend = (rangeKey) => {
      const dataset = trendData[rangeKey]
      const points = buildPoints(dataset.values)
      const path = buildPath(points)

      line.setAttribute("d", path)
      area.setAttribute("d", `${path} L${points.at(-1).x.toFixed(1)} ${chartBounds.bottom} L${points[0].x.toFixed(1)} ${chartBounds.bottom} Z`)

      Object.entries(dataset.kpis).forEach(([key, value]) => {
        if (kpiNodes[key]) kpiNodes[key].textContent = value
      })

      Object.entries(dataset.summary).forEach(([key, value]) => {
        if (summaryNodes[key]) summaryNodes[key].textContent = value
      })

      axis.textContent = ""
      dots.textContent = ""

      points.forEach((point, index) => {
        const axisText = document.createElementNS(svgNS, "text")
        axisText.setAttribute("x", point.x)
        axisText.setAttribute("y", "238")
        axisText.textContent = dataset.axis[index]
        axis.append(axisText)

        const group = document.createElementNS(svgNS, "g")
        const circle = document.createElementNS(svgNS, "circle")

        group.setAttribute("class", "trend-point")
        group.setAttribute("tabindex", "0")
        group.setAttribute("role", "button")
        group.setAttribute("aria-label", dataset.labels[index])
        group.setAttribute("transform", `translate(${point.x.toFixed(1)} ${point.y.toFixed(1)})`)
        circle.setAttribute("r", "5.5")
        group.append(circle)

        group.addEventListener("pointerenter", () => setActiveTrendPoint(index, dataset))
        group.addEventListener("focus", () => setActiveTrendPoint(index, dataset))
        group.addEventListener("click", () => setActiveTrendPoint(index, dataset))
        dots.append(group)
      })

      rangeButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.range === rangeKey))
      line.classList.remove("is-animating")
      line.getBoundingClientRect()
      line.classList.add("is-animating")
      setActiveTrendPoint(points.length - 1, dataset)
    }

    rangeButtons.forEach((button) => {
      button.addEventListener("click", () => renderTrend(button.dataset.range))
    })

    renderTrend("week")
  }

  const statusWidget = document.querySelector("[data-status-widget]")
  const statusData = {
    onsite: { value: "31", label: "на объекте", color: "16, 169, 121", note: "31 инженер уже подтвердил присутствие на объекте." },
    route: { value: "7", label: "в пути", color: "240, 166, 59", note: "7 инженеров находятся в пути или еще завершают переход между объектами." },
    missing: { value: "4", label: "без отметки", color: "230, 62, 103", note: "4 зоны требуют внимания руководителя до закрытия смены." },
    reports: { value: "126", label: "отчетов", color: "34, 88, 232", note: "126 отчетов связаны с объектами, датами и вложениями." },
  }

  if (statusWidget) {
    const buttons = [...statusWidget.querySelectorAll("[data-status]")]
    const valueNode = statusWidget.querySelector("[data-status-value]")
    const labelNode = statusWidget.querySelector("[data-status-label]")
    const noteNode = statusWidget.querySelector("[data-status-note]")
    const donut = statusWidget.querySelector("[data-donut]")

    const setStatus = (key) => {
      const data = statusData[key]
      valueNode.textContent = data.value
      labelNode.textContent = data.label
      noteNode.textContent = data.note
      donut.style.boxShadow = `inset 0 0 0 1px rgba(255,255,255,0.8), 0 22px 44px rgba(${data.color}, 0.2)`
      buttons.forEach((button) => button.classList.toggle("is-active", button.dataset.status === key))
    }

    buttons.forEach((button) => {
      button.addEventListener("pointerenter", () => setStatus(button.dataset.status))
      button.addEventListener("focus", () => setStatus(button.dataset.status))
      button.addEventListener("click", () => setStatus(button.dataset.status))
    })

    setStatus("onsite")
  }

  const coverageWidget = document.querySelector("[data-coverage-widget]")
  const coverageNotes = {
    orion: "На объекте закрыты основные точки присутствия и журнала.",
    north: "Осталось добавить метки для двух вспомогательных зон.",
    west: "Покрытие растет: ключевые входные точки уже привязаны.",
  }

  if (coverageWidget) {
    const buttons = [...coverageWidget.querySelectorAll("[data-coverage]")]
    const valueNode = coverageWidget.querySelector("[data-coverage-value]")
    const pillNode = coverageWidget.querySelector("[data-coverage-pill]")
    const noteNode = coverageWidget.querySelector("[data-coverage-note]")

    requestAnimationFrame(() => {
      buttons.forEach((button) => {
        button.style.setProperty("--bar-value", `${Number(button.dataset.value) / 100}`)
      })
    })

    const setCoverage = (key, value) => {
      coverageWidget.style.setProperty("--coverage-value", value)
      valueNode.textContent = `${value}%`
      pillNode.textContent = `${value}%`
      noteNode.textContent = coverageNotes[key]
      buttons.forEach((button) => button.classList.toggle("is-active", button.dataset.coverage === key))
    }

    buttons.forEach((button) => {
      const value = button.dataset.value
      const key = button.dataset.coverage
      button.addEventListener("pointerenter", () => setCoverage(key, value))
      button.addEventListener("focus", () => setCoverage(key, value))
      button.addEventListener("click", () => setCoverage(key, value))
    })

    setCoverage("orion", "86")
  }
})()
