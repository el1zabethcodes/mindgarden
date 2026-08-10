from sqlalchemy.orm import Session
from database import engine, SessionLocal, Base
import models
import crud
import schemas

def seed_db():
    print("initializing database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # clear existing data
        db.query(models.note_tags).delete()
        db.query(models.note_links).delete()
        db.query(models.Note).delete()
        db.query(models.Tag).delete()
        db.commit()
        
        print("seeding tags...")
        # let's pre-create some tags
        tags = [
            ("philosophy", "lavender_cool"),
            ("design", "sage"),
            ("architecture", "slate"),
            ("recipes", "rose"),
            ("productivity", "mint")
        ]
        tag_map = {}
        for name, col in tags:
            tag = models.Tag(id=crud.slugify(name), name=name, color=col)
            db.add(tag)
            tag_map[name] = tag
        db.commit()
        
        print("seeding notes...")
        
        # note 1: design philosophy
        n1 = crud.create_note(db, schemas.NoteCreate(
            title="Soft Minimalist Design",
            content="""The essence of soft minimalism lies in the intentionality of space. 

Instead of stark, cold environments, we focus on warm natural materials, soft lighting, and tactical textures. 

### Key Principles
1. **subtle palettes**: off-whites, warm sands, sage greens.
2. **tactile materials**: linen, unfinished oak, matte ceramics.
3. **negative space**: letting elements breathe.

*“minimalism is not the lack of something. it's the perfect amount of something.”*""",
            status="evergreen",
            mood_color="sage",
            is_favorite=True,
            tags=["design", "philosophy"]
        ))
        
        # note 2: book recommendations
        n2 = crud.create_note(db, schemas.NoteCreate(
            title="Reading List: Space and Calm",
            content="""A curated collection of literature that explores architecture, mindfulness, and slow living:

* **The Poetics of Space** by Gaston Bachelard — an beautiful exploration of how we experience intimate spaces (homes, drawers, corners).
* **Wabi-Sabi for Artists, Designers, Poets & Philosophers** by Leonard Koren — the classic treatise on finding beauty in imperfection and impermanence.
* **In Praise of Shadows** by Jun'ichirō Tanizaki — on the aesthetics of light, shadow, and traditional Japanese architecture.

highly recommend reading these during quiet mornings.""",
            status="growing",
            mood_color="slate",
            tags=["books", "philosophy", "architecture"]
        ))
        
        # note 3: mint tea recipe
        n3 = crud.create_note(db, schemas.NoteCreate(
            title="Cold Mint & Sage Infusion",
            content="""A refreshing, calm herbal drink to tend the mind garden:

### Ingredients
* 5-6 fresh mint leaves (bruised slightly)
* 2 dried sage leaves
* 1 slice of lemon
* hot water (85°C / 185°F)

### Instructions
1. steep the herbs in hot water for exactly 5 minutes.
2. pour over ice in a tall glass.
3. sweeten with a drop of raw honey if desired.

perfect for hot afternoon coding sessions.""",
            status="seed",
            mood_color="mint",
            tags=["recipes"]
        ))
        
        # note 4: knowledge gardening
        n4 = crud.create_note(db, schemas.NoteCreate(
            title="The Concept of Knowledge Gardening",
            content="""Unlike traditional rigid note-taking systems, a digital garden focuses on growth over time. 

Notes are treated like plants:
* 🌱 **seeds**: raw, unpolished ideas or highlights.
* 🌿 **growing**: notes that are expanding and starting to connect.
* 🌳 **evergreen**: well-researched, stable ideas with rich interlinks.

connections form naturally as you link notes together, creating a web of personal intelligence.""",
            status="evergreen",
            mood_color="lavender_cool",
            is_favorite=True,
            tags=["philosophy", "productivity"]
        ))
        
        print("setting up connections...")
        # link note 1 with note 2 and note 4
        crud.set_note_links(db, n1.id, [n2.id, n4.id])
        # link note 2 with note 4
        crud.set_note_links(db, n2.id, [n4.id, n1.id])
        
        print("database seeded successfully!")
        
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
