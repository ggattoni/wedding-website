const GALLERY_IMAGES = [
    "gallery-01.jpg",
    "gallery-03.jpg",
    "gallery-04.jpg",
    "gallery-05.jpg",
    "gallery-06.jpg",
    "gallery-07.jpg",
    "gallery-08.jpg",
    "gallery-09.jpg",
    "gallery-10.jpg",
    "gallery-12.jpg",
    "gallery-13.jpg",
    "gallery-14.jpg",
    "gallery-15.jpg",
    "gallery-17.jpg",
    "gallery-18.jpg",
    "gallery-19.jpg",
    "gallery-20.jpg",
    "gallery-21.jpg",
];

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

document.addEventListener("DOMContentLoaded", () => {
    // Countdown Timer
    const countdownDate = new Date("September 12, 2026 10:30 AM").getTime();

    const updateCountdown = () => {
        const now = new Date().getTime();
        const distance = countdownDate - now;

        if (distance < 0) {
            document.getElementById("days").innerText = "0";
            document.getElementById("hours").innerText = "0";
            document.getElementById("minutes").innerText = "0";
            // document.getElementById('seconds').innerText = '0';
        } else {
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor(
                (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
            );
            const minutes = Math.floor(
                (distance % (1000 * 60 * 60)) / (1000 * 60),
            );
            // const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            document.getElementById("days").innerText = String(days).padStart(
                2,
                "0",
            );
            document.getElementById("hours").innerText = String(hours).padStart(
                2,
                "0",
            );
            document.getElementById("minutes").innerText = String(
                minutes,
            ).padStart(2, "0");
            // document.getElementById('seconds').innerText = String(seconds).padStart(2, '0');
        }
    };

    updateCountdown();
    setInterval(updateCountdown, 1000);

    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
    const navLinks = document.querySelector(".nav-links");

    mobileMenuBtn.addEventListener("click", () => {
        navLinks.classList.toggle("active");
        mobileMenuBtn.classList.toggle("active");
    });

    // Close mobile menu when a link is clicked
    document.querySelectorAll(".nav-links a").forEach((link) => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("active");
            mobileMenuBtn.classList.remove("active");
        });
    });

    // Close mobile menu when clicking outside the navbar
    document.addEventListener("click", (e) => {
        // Only respond to actual user clicks (not programmatic clicks like .click())
        if (!e.isTrusted) return;

        const isClickInsideNavbar = e.target.closest(".navbar");
        if (!isClickInsideNavbar && navLinks.classList.contains("active")) {
            navLinks.classList.remove("active");
            mobileMenuBtn.classList.remove("active");
        }
    });

    // Accordion Logic
    const accordionHeaders = document.querySelectorAll(".accordion-header");

    accordionHeaders.forEach((header) => {
        header.addEventListener("click", () => {
            const content = header.nextElementSibling;
            const isActive = header.classList.contains("active");

            // Close all other accordion items
            document.querySelectorAll(".accordion-header").forEach((h) => {
                h.classList.remove("active");
                h.nextElementSibling.style.maxHeight = null;
            });

            // Toggle current item
            if (!isActive) {
                header.classList.add("active");
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });

    // Smooth Scroll for anchor links (polyfill for older browsers if needed, but CSS scroll-behavior usually handles it)
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
            e.preventDefault();
            const targetId = this.getAttribute("href");
            if (targetId === "#") return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: "smooth",
                });
            }
        });
    });

    // Gallery: populate slides then mount Splide
    const splideList = document.querySelector("#gallery-splide .splide__list");
    if (splideList) {
        const shuffled = shuffleArray([...GALLERY_IMAGES]);
        shuffled.forEach((filename, index) => {
            const li = document.createElement("li");
            li.className = "splide__slide";
            const img = document.createElement("img");
            img.dataset.splideLazy = `assets/gallery/${filename}`;
            img.alt = `Foto ${index + 1}`;
            li.appendChild(img);
            splideList.appendChild(li);
        });

        new Splide("#gallery-splide", {
            type: "loop",
            autoWidth: true,
            fixedHeight: "400px",
            gap: "1rem",
            pagination: false,
            arrows: false,
            drag: "free",
            lazyLoad: "nearby",
            autoScroll: {
                speed: 0.5,
                pauseOnHover: true,
                pauseOnFocus: true,
            },
            breakpoints: {
                768: { fixedHeight: "300px" },
            },
        }).mount(window.splide.Extensions);
    }

    // ============================================
    // RSVP Modal Logic
    // ============================================

    // Initialize Supabase client
    const supabase = window.supabase.createClient(
        CONFIG.SUPABASE_URL,
        CONFIG.SUPABASE_ANON_KEY,
    );

    // Initialize EmailJS
    emailjs.init(CONFIG.EMAILJS_PUBLIC_KEY);

    // DOM Elements
    const modal = document.getElementById("rsvpModal");
    const openModalBtn = document.getElementById("openRsvpModal");
    const closeModalBtn = document.querySelector(".modal-close");
    const searchSection = document.getElementById("searchSection");
    const resultsSection = document.getElementById("resultsSection");
    const loadingState = document.getElementById("loadingState");
    const successMessage = document.getElementById("successMessage");
    const errorMessageSection = document.getElementById("errorMessage");
    const searchGuestBtn = document.getElementById("searchGuestBtn");
    const guestNameInput = document.getElementById("guestNameInput");
    const searchError = document.getElementById("searchError");
    const guestsList = document.getElementById("guestsList");
    const rsvpForm = document.getElementById("rsvpForm");
    const backToSearchBtn = document.getElementById("backToSearchBtn");
    const closeSuccessBtn = document.getElementById("closeModalBtn");
    const retryBtn = document.getElementById("retryBtn");
    const errorText = document.getElementById("errorText");

    let currentGuests = [];

    // Open modal
    openModalBtn.addEventListener("click", () => {
        modal.classList.add("active");
        document.body.style.overflow = "hidden";
        resetModal();
    });

    // Close modal
    const closeModal = () => {
        modal.classList.remove("active");
        document.body.style.overflow = "";
        resetModal();
    };

    closeModalBtn.addEventListener("click", closeModal);
    closeSuccessBtn.addEventListener("click", closeModal);

    // Close on background click
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Reset modal to initial state
    function resetModal() {
        searchSection.style.display = "block";
        resultsSection.style.display = "none";
        loadingState.style.display = "none";
        successMessage.style.display = "none";
        errorMessageSection.style.display = "none";
        searchError.classList.remove("active");
        searchError.textContent = "";
        guestNameInput.value = "";
        guestsList.innerHTML = "";
        currentGuests = [];
    }

    // Back to search
    backToSearchBtn.addEventListener("click", () => {
        resetModal();
    });

    // Retry on error
    retryBtn.addEventListener("click", () => {
        resetModal();
    });

    // Search for guests
    searchGuestBtn.addEventListener("click", async () => {
        await searchGuests();
    });

    // Allow Enter key to search
    guestNameInput.addEventListener("keypress", async (e) => {
        if (e.key === "Enter") {
            await searchGuests();
        }
    });

    async function searchGuests() {
        const searchTerm = guestNameInput.value.trim();

        if (!searchTerm) {
            showSearchError("Per favore, inserisci nome e cognome.");
            return;
        }

        searchError.classList.remove("active");
        searchGuestBtn.disabled = true;
        searchGuestBtn.textContent = "Ricerca...";

        try {
            // Only fetch non-sensitive fields (exclude intolerance/info for privacy)
            const { data: guestsList, error } = await supabase
                .from("guests")
                .select("id, name, surname, confirmed");

            if (error) throw error;

            // Find guest where "name surname" matches input (case-insensitive)
            const searchLower = searchTerm.toLowerCase();
            const matchedGuest = guestsList.find((g) => {
                const fullName = `${g.name} ${g.surname}`.toLowerCase();
                return fullName === searchLower;
            });

            if (!matchedGuest) {
                showSearchError(
                    "Non abbiamo trovato nessun invito con questo nome e cognome. Verifica di aver scritto correttamente o contattaci!",
                );
                searchGuestBtn.disabled = false;
                searchGuestBtn.textContent = "Cerca";
                return;
            }

            // Get the first matched guest's group
            // const firstGuest = guests[0]; // This line was problematic as 'guests' was undefined here

            // Find all guests in the same group
            const { data: groupData, error: groupError } = await supabase
                .from("groups")
                .select("group_id")
                .eq("guest_id", matchedGuest.id)
                .single();

            if (groupError) {
                // Guest is not in a group, just show the single guest
                currentGuests = [matchedGuest];
                displayGuests([matchedGuest]);
                return;
            }

            // Get all guests in the same group
            const { data: groupMembers, error: membersError } = await supabase
                .from("groups")
                .select("guest_id")
                .eq("group_id", groupData.group_id);

            if (membersError) throw membersError;

            const guestIds = groupMembers.map((m) => m.guest_id);

            // Only fetch non-sensitive fields (exclude intolerance/info for privacy)
            const { data: allGuests, error: allGuestsError } = await supabase
                .from("guests")
                .select("id, name, surname, confirmed")
                .in("id", guestIds);

            if (allGuestsError) throw allGuestsError;

            currentGuests = allGuests;
            displayGuests(allGuests);
        } catch (error) {
            console.error("Search error:", error);
            showSearchError(
                "Si è verificato un errore durante la ricerca. Riprova più tardi.",
            );
        } finally {
            searchGuestBtn.disabled = false;
            searchGuestBtn.textContent = "Cerca";
        }
    }

    function showSearchError(message) {
        searchError.textContent = message;
        searchError.classList.add("active");
    }

    function displayGuests(guests) {
        guestsList.innerHTML = "";

        guests.forEach((guest) => {
            const guestCard = document.createElement("div");
            guestCard.className = "guest-card";
            guestCard.dataset.guestId = guest.id;

            const guestName = document.createElement("div");
            guestName.className = "guest-name";
            guestName.textContent = `${guest.name} ${guest.surname}`;
            if (guest.confirmed !== null && guest.confirmed !== undefined) {
                const badge = document.createElement("span");
                badge.className = "badge-responded";
                badge.textContent = "già risposto";
                guestName.appendChild(badge);
            }
            guestCard.appendChild(guestName);

            // Attendance confirmation (Sì/No exclusive checkboxes)
            const attendanceLabel = document.createElement("div");
            attendanceLabel.className = "guest-question";
            attendanceLabel.textContent = "Parteciperà al matrimonio?";
            guestCard.appendChild(attendanceLabel);

            const attendanceOptions = document.createElement("div");
            attendanceOptions.className = "attendance-options";
            attendanceOptions.innerHTML = `
                <div class="guest-option">
                    <input type="checkbox" id="attend-yes-${guest.id}">
                    <label for="attend-yes-${guest.id}">Sì</label>
                </div>
                <div class="guest-option">
                    <input type="checkbox" id="attend-no-${guest.id}">
                    <label for="attend-no-${guest.id}">No</label>
                </div>
            `;
            guestCard.appendChild(attendanceOptions);

            // Exclusivity logic for Sì/No
            const yesCheckbox = attendanceOptions.querySelector(
                `#attend-yes-${guest.id}`,
            );
            const noCheckbox = attendanceOptions.querySelector(
                `#attend-no-${guest.id}`,
            );

            // Allergy checkbox (conditionally shown based on attendance)
            const allergyOption = document.createElement("div");
            allergyOption.className = "guest-option";
            allergyOption.style.display = "none";
            allergyOption.innerHTML = `
                <input type="checkbox" id="allergy-${guest.id}">
                <label for="allergy-${guest.id}">Ho allergie o intolleranze</label>
            `;
            guestCard.appendChild(allergyOption);

            // Allergy details (conditionally shown based on allergy checkbox)
            const allergyDetails = document.createElement("div");
            allergyDetails.className = "allergy-details";
            allergyDetails.style.display = "none";
            allergyDetails.innerHTML = `
                <input type="text" id="allergy-info-${guest.id}" placeholder="Specifica allergie o intolleranze...">
            `;
            guestCard.appendChild(allergyDetails);

            // Toggle allergy options visibility based on attendance
            yesCheckbox.addEventListener("change", () => {
                if (yesCheckbox.checked) {
                    noCheckbox.checked = false;
                    allergyOption.style.display = "flex";
                    // Keep allergyDetails visibility based on allergy checkbox
                    allergyDetails.style.display = allergyCheckbox.checked
                        ? "block"
                        : "none";
                } else {
                    allergyOption.style.display = "none";
                    allergyDetails.style.display = "none";
                }
            });

            noCheckbox.addEventListener("change", () => {
                if (noCheckbox.checked) {
                    yesCheckbox.checked = false;
                    allergyOption.style.display = "none";
                    allergyDetails.style.display = "none";
                }
            });

            // Toggle allergy details on allergy checkbox change
            const allergyCheckbox = allergyOption.querySelector("input");
            allergyCheckbox.addEventListener("change", (e) => {
                allergyDetails.style.display = e.target.checked
                    ? "block"
                    : "none";
            });

            guestsList.appendChild(guestCard);
        });

        searchSection.style.display = "none";
        resultsSection.style.display = "block";
    }

    // Submit RSVP
    rsvpForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Show loading state
        resultsSection.style.display = "none";
        loadingState.style.display = "block";

        try {
            // Collect data for each guest before updating
            const submissionData = [];

            for (const guest of currentGuests) {
                const yesCheckbox = document.getElementById(
                    `attend-yes-${guest.id}`,
                );
                const noCheckbox = document.getElementById(
                    `attend-no-${guest.id}`,
                );
                const allergyCheckbox = document.getElementById(
                    `allergy-${guest.id}`,
                );
                const allergyInfoInput = document.getElementById(
                    `allergy-info-${guest.id}`,
                );

                // Determine confirmed status: true for yes, false for no, null for neither
                let confirmed = null;
                if (yesCheckbox.checked) confirmed = true;
                else if (noCheckbox.checked) confirmed = false;

                let hasAllergy = null;
                let allergyInfo = null;

                // Only set allergy info if guest is confirmed to attend
                if (confirmed === true) {
                    hasAllergy = allergyCheckbox.checked;
                    allergyInfo = hasAllergy
                        ? allergyInfoInput.value.trim()
                        : null;
                }

                // Store submission data
                submissionData.push({
                    name: guest.name,
                    surname: guest.surname,
                    confirmed: confirmed,
                });

                // Update database
                const { error } = await supabase
                    .from("guests")
                    .update({
                        confirmed: confirmed,
                        intolerance: hasAllergy,
                        info: allergyInfo,
                    })
                    .eq("id", guest.id);

                if (error) throw error;
            }

            // After successful update, send email with submission data
            await sendRsvpEmail(submissionData);

            // Show success message
            loadingState.style.display = "none";
            successMessage.style.display = "block";
        } catch (error) {
            console.error("RSVP submission error:", error);
            loadingState.style.display = "none";
            errorText.textContent =
                "Si è verificato un errore durante l'invio. Riprova più tardi o contattaci direttamente.";
            errorMessageSection.style.display = "block";
        }
    });

    async function sendRsvpEmail(submissionData) {
        try {
            // Get overall statistics from database
            const { data: allGuests, error: statsError } = await supabase
                .from("guests")
                .select("id, confirmed");

            if (statsError) throw statsError;

            const totalGuests = allGuests.length;
            const respondedGuests = allGuests.filter(
                (g) => g.confirmed !== null,
            );
            const allConfirmedGuests = allGuests.filter(
                (g) => g.confirmed === true,
            );

            const numConfirmed = allConfirmedGuests.length;
            const numAnswers = respondedGuests.length;
            const percNumAnswers = ((numAnswers / totalGuests) * 100).toFixed(
                1,
            );

            // Use submission data for confirmed/declined lists (only current submission)
            const confirmedGuests = submissionData.filter(
                (g) => g.confirmed === true,
            );
            const declinedGuests = submissionData.filter(
                (g) => g.confirmed === false,
            );

            const confirmedNames = confirmedGuests
                .map((g) => `${g.name} ${g.surname}`)
                .join(", ");
            const declinedNames = declinedGuests
                .map((g) => `${g.name} ${g.surname}`)
                .join(", ");

            // Send email via EmailJS
            const templateParams = {
                confirmed: confirmedNames || "Nessuno",
                declined: declinedNames || "Nessuno",
                num_answers: numAnswers,
                perc_num_answers: percNumAnswers,
                num_confirmed: numConfirmed,
            };

            await emailjs.send(
                CONFIG.EMAILJS_SERVICE_ID,
                CONFIG.EMAILJS_TEMPLATE_ID,
                templateParams,
            );
        } catch (error) {
            console.error("Email sending error:", error);
            // Don't throw - we still want to show success even if email fails
            // Email failure is not critical to the RSVP process
        }
    }
});
