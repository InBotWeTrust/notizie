"use client";

import { useEffect } from "react";

export function MobileMenuController() {
  useEffect(() => {
    const root = document.documentElement;
    const trigger = document.querySelector<HTMLButtonElement>(".lqd-mobile-sec .navbar-toggle");
    const nav = document.getElementById("lqd-mobile-sec-nav");
    const navShell = nav?.closest<HTMLElement>(".lqd-mobile-sec-nav");
    const backdrop = document.createElement("button");

    if (!trigger || !nav) {
      return;
    }

    backdrop.type = "button";
    backdrop.className = "lqd-mobile-menu-backdrop";
    backdrop.tabIndex = -1;
    backdrop.setAttribute("aria-label", "Close mobile menu");
    document.body.append(backdrop);

    const closeMenu = () => {
      root.classList.remove("mobile-nav-activated");
      trigger.classList.add("collapsed");
      trigger.setAttribute("aria-expanded", "false");
      nav.setAttribute("aria-expanded", "false");
      if (navShell) {
        navShell.style.setProperty("transform", "translateX(104%)", "important");
        navShell.style.setProperty("translate", "0 0", "important");
      }
    };

    const toggleMenu = () => {
      const isOpen = root.classList.toggle("mobile-nav-activated");
      trigger.classList.toggle("collapsed", !isOpen);
      trigger.setAttribute("aria-expanded", String(isOpen));
      nav.setAttribute("aria-expanded", String(isOpen));
      if (navShell) {
        navShell.style.setProperty("transform", "translateX(104%)", "important");
        navShell.style.setProperty("translate", isOpen ? "-104% 0" : "0 0", "important");
      }
    };

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    trigger.addEventListener("click", toggleMenu);
    backdrop.addEventListener("click", closeMenu);
    nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", handleKeydown);

    return () => {
      trigger.removeEventListener("click", toggleMenu);
      backdrop.removeEventListener("click", closeMenu);
      nav.querySelectorAll("a").forEach((link) => link.removeEventListener("click", closeMenu));
      document.removeEventListener("keydown", handleKeydown);
      backdrop.remove();
    };
  }, []);

  useEffect(() => {
    const forms = Array.from(document.querySelectorAll<HTMLFormElement>(".lead-form[data-step-form]"));

    const cleanups = forms.map((form) => {
      const steps = Array.from(form.querySelectorAll<HTMLElement>(".lead-form__step"));
      const currentLabel = form.querySelector<HTMLElement>(".lead-form__progress-current");
      const progressBar = form.querySelector<HTMLElement>(".lead-form__progress i span");
      const progressDots = Array.from(form.querySelectorAll<HTMLElement>(".lead-form__steps li"));
      let currentStep = steps.findIndex((step) => step.classList.contains("is-active"));

      if (currentStep < 0) {
        currentStep = 0;
      }

      const showStep = (index: number) => {
        currentStep = Math.max(0, Math.min(index, steps.length - 1));
        steps.forEach((step, stepIndex) => {
          const isActive = stepIndex === currentStep;
          step.classList.toggle("is-active", isActive);
          step.setAttribute("aria-hidden", String(!isActive));
        });

        if (currentLabel) {
          currentLabel.textContent = String(currentStep + 1);
        }

        if (progressBar) {
          progressBar.style.width = `${((currentStep + 1) / steps.length) * 100}%`;
        }

        progressDots.forEach((dot, dotIndex) => {
          dot.classList.toggle("is-active", dotIndex === currentStep);
          dot.classList.toggle("is-complete", dotIndex < currentStep);
        });
      };

      const nextHandlers = Array.from(form.querySelectorAll<HTMLButtonElement>(".lead-form__next")).map((button) => {
        const handler = () => {
          const step = button.closest<HTMLElement>(".lead-form__step");
          const stepIndex = step ? steps.indexOf(step) : currentStep;
          const checked = step?.querySelector<HTMLInputElement>('input[type="radio"]:checked');
          const firstRadio = step?.querySelector<HTMLInputElement>('input[type="radio"]');

          if (!checked) {
            firstRadio?.reportValidity();
            return;
          }

          showStep(stepIndex + 1);
        };

        button.addEventListener("click", handler);
        return () => button.removeEventListener("click", handler);
      });

      const submitHandler = (event: SubmitEvent) => {
        if (form.checkValidity()) {
          return;
        }

        event.preventDefault();
        const invalid = form.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(":invalid");
        const step = invalid?.closest<HTMLElement>(".lead-form__step");
        const stepIndex = step ? steps.indexOf(step) : currentStep;
        showStep(stepIndex);
        window.setTimeout(() => invalid?.reportValidity(), 80);
      };

      form.addEventListener("submit", submitHandler);
      showStep(currentStep);

      return () => {
        nextHandlers.forEach((cleanup) => cleanup());
        form.removeEventListener("submit", submitHandler);
      };
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  useEffect(() => {
    const wrappers = Array.from(document.querySelectorAll<HTMLElement>(".elementor-image-carousel-wrapper"));

    const cleanups = wrappers.map((wrapper) => {
      const slides = Array.from(wrapper.querySelectorAll<HTMLElement>(".swiper-slide"));
      const prev = wrapper.querySelector<HTMLElement>(".elementor-swiper-button-prev");
      const next = wrapper.querySelector<HTMLElement>(".elementor-swiper-button-next");
      const pagination = wrapper.querySelector<HTMLElement>(".swiper-pagination");
      let current = 0;

      if (!slides.length) {
        return () => {};
      }

      wrapper.classList.toggle("is-single-slide", slides.length < 2);

      if (pagination) {
        pagination.innerHTML = slides
          .map(
            (_, index) =>
              `<button type="button" class="swiper-pagination-bullet" aria-label="Vai alla slide ${
                index + 1
              }"></button>`,
          )
          .join("");
      }

      const bullets = pagination
        ? Array.from(pagination.querySelectorAll<HTMLButtonElement>(".swiper-pagination-bullet"))
        : [];

      const show = (index: number) => {
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
          const isActive = slideIndex === current;
          slide.classList.toggle("is-active", isActive);
          slide.setAttribute("aria-hidden", String(!isActive));
        });
        bullets.forEach((bullet, bulletIndex) => {
          bullet.classList.toggle("is-active", bulletIndex === current);
          bullet.setAttribute("aria-current", bulletIndex === current ? "true" : "false");
        });
      };

      const goPrev = () => show(current - 1);
      const goNext = () => show(current + 1);
      const bulletHandlers = bullets.map((bullet, index) => {
        const handler = () => show(index);
        bullet.addEventListener("click", handler);
        return () => bullet.removeEventListener("click", handler);
      });

      prev?.addEventListener("click", goPrev);
      next?.addEventListener("click", goNext);
      show(0);

      return () => {
        prev?.removeEventListener("click", goPrev);
        next?.removeEventListener("click", goNext);
        bulletHandlers.forEach((cleanup) => cleanup());
      };
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  useEffect(() => {
    const countdowns = Array.from(document.querySelectorAll<HTMLElement>(".elementor-countdown-wrapper"));

    if (!countdowns.length) {
      return;
    }

    const endAt = Date.now() + 15 * 60 * 1000;

    const tick = () => {
      const remaining = Math.max(0, endAt - Date.now());
      const totalSeconds = Math.floor(remaining / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      const values = [hours, minutes, seconds].map((value) => String(value).padStart(2, "0"));

      countdowns.forEach((countdown) => {
        const hoursEl = countdown.querySelector<HTMLElement>(".elementor-countdown-hours");
        const minutesEl = countdown.querySelector<HTMLElement>(".elementor-countdown-minutes");
        const secondsEl = countdown.querySelector<HTMLElement>(".elementor-countdown-seconds");

        if (hoursEl) hoursEl.textContent = values[0];
        if (minutesEl) minutesEl.textContent = values[1];
        if (secondsEl) secondsEl.textContent = values[2];
      });
    };

    tick();
    const interval = window.setInterval(tick, 1000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href="#form"]'));
    const pendingTimers = new Set<number>();

    if (!links.length) {
      return;
    }

    const scrollToForm = (behavior: ScrollBehavior = "smooth") => {
      const target = document.getElementById("form");
      const header = document.querySelector<HTMLElement>(".main-header");

      if (!target) {
        return;
      }

      const headerHeight = header?.getBoundingClientRect().height ?? 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
      window.scrollTo({ top: Math.max(0, top), behavior });
    };

    const scheduleCorrection = (delay: number) => {
      const timer = window.setTimeout(() => {
        pendingTimers.delete(timer);
        scrollToForm("auto");
      }, delay);
      pendingTimers.add(timer);
    };

    const handleAnchorClick = (event: MouseEvent) => {
      event.preventDefault();
      document.documentElement.classList.remove("mobile-nav-activated");
      window.history.pushState(null, "", "#form");
      scrollToForm();
      scheduleCorrection(700);
      scheduleCorrection(1600);
    };

    links.forEach((link) => link.addEventListener("click", handleAnchorClick));

    return () => {
      links.forEach((link) => link.removeEventListener("click", handleAnchorClick));
      pendingTimers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return null;
}
