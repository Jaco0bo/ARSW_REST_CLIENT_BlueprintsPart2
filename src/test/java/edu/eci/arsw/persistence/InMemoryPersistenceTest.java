package edu.eci.arsw.persistence;

import edu.eci.arsw.model.Blueprint;
import edu.eci.arsw.model.Point;
import edu.eci.arsw.persistence.BlueprintNotFoundException;
import edu.eci.arsw.persistence.BlueprintPersistenceException;
import edu.eci.arsw.persistence.BlueprintsPersistence;
import edu.eci.arsw.persistence.impl.InMemoryBlueprintPersistence;

import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 *
 * @author hcadavid
 */
public class InMemoryPersistenceTest {

    private BlueprintsPersistence persistence;
    private Blueprint blueprint1;
    private Blueprint blueprint2;
    private Blueprint blueprint3;

    @BeforeEach
    public void setUp() throws BlueprintPersistenceException {
        persistence = new InMemoryBlueprintPersistence();
        blueprint1 = new Blueprint("author1", "blueprint1", new Point[]{new Point(1, 1)});
        blueprint2 = new Blueprint("author1", "blueprint2", new Point[]{new Point(2, 2)});
        blueprint3 = new Blueprint("author2", "blueprint3", new Point[]{new Point(3, 3)});

        persistence.saveBlueprint(blueprint1);
        persistence.saveBlueprint(blueprint2);
        persistence.saveBlueprint(blueprint3);
    }

    @Test
    public void saveNewAndLoadTest() throws BlueprintPersistenceException, BlueprintNotFoundException {
        InMemoryBlueprintPersistence ibpp = new InMemoryBlueprintPersistence();

        Point[] pts0 = new Point[]{new Point(40, 40), new Point(15, 15)};
        Blueprint bp0 = new Blueprint("mack", "mypaint", pts0);
        ibpp.saveBlueprint(bp0);

        Point[] pts = new Point[]{new Point(0, 0), new Point(10, 10)};
        Blueprint bp = new Blueprint("john", "thepaint", pts);
        ibpp.saveBlueprint(bp);

        assertNotNull(ibpp.getBlueprint(bp.getAuthor(), bp.getName()));
        assertEquals(ibpp.getBlueprint(bp.getAuthor(), bp.getName()), bp);
    }

    @Test
    public void saveExistingBpTest() {
        InMemoryBlueprintPersistence ibpp = new InMemoryBlueprintPersistence();

        Point[] pts = new Point[]{new Point(0, 0), new Point(10, 10)};
        Blueprint bp = new Blueprint("john", "thepaint", pts);

        try {
            ibpp.saveBlueprint(bp);
        } catch (BlueprintPersistenceException ex) {
            fail("Blueprint persistence failed inserting the first blueprint.");
        }

        Point[] pts2 = new Point[]{new Point(10, 10), new Point(20, 20)};
        Blueprint bp2 = new Blueprint("john", "thepaint", pts2);

        try {
            ibpp.saveBlueprint(bp2);
            fail("An exception was expected after saving a second blueprint with the same name and author");
        } catch (BlueprintPersistenceException ex) {
            // Expected exception
        }
    }

    @Test
    public void testGetBlueprintByAuthorAndName() throws BlueprintNotFoundException {
        Blueprint result = persistence.getBlueprint("author1", "blueprint1");
        assertNotNull(result);
        assertEquals("blueprint1", result.getName());
        assertEquals("author1", result.getAuthor());
    }

    @Test
    public void testGetBlueprintByAuthorAndNameNotFound() {
        assertThrows(BlueprintNotFoundException.class, () -> {
            persistence.getBlueprint("author1", "blueprint4");
        });
    }

    @Test
    public void testGetBlueprintsByAuthor() throws BlueprintNotFoundException {
        Set<Blueprint> result = persistence.getBlueprintsByAuthor("author1");
        assertEquals(2, result.size());
    }

    @Test
    public void testGetBlueprintsByAuthorNotFound() {
        assertThrows(BlueprintNotFoundException.class, () -> {
            persistence.getBlueprintsByAuthor("author3"); // No blueprints for author3
        });
    }
}

