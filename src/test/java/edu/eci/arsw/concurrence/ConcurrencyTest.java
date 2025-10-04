package edu.eci.arsw.concurrence;

import edu.eci.arsw.model.Blueprint;
import edu.eci.arsw.model.Point;
import edu.eci.arsw.persistence.BlueprintPersistenceException;
import edu.eci.arsw.persistence.impl.InMemoryBlueprintPersistence;
import org.junit.jupiter.api.Test;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class ConcurrencyTest {

    @Test
    public void concurrentSaveBlueprints_onlyOneSucceeds() throws InterruptedException {
        // Arrange
        InMemoryBlueprintPersistence bpp = new InMemoryBlueprintPersistence();
        Point[] pointsArray = new Point[]{ new Point(1, 1), new Point(2, 2) };
        Blueprint bp = new Blueprint("concurrent", "one", pointsArray);

        ExecutorService ex = Executors.newFixedThreadPool(20);
        AtomicInteger success = new AtomicInteger(0);

        //100 tareas intentan insertar el mismo blueprint
        for (int i = 0; i < 100; i++) {
            ex.submit(() -> {
                try {
                    bpp.saveBlueprint(bp);
                    success.incrementAndGet();
                } catch (BlueprintPersistenceException e) {
                    // Esperando threads
                }
            });
        }

        ex.shutdown();
        boolean finished = ex.awaitTermination(10, TimeUnit.SECONDS);
        if (!finished) {
            ex.shutdownNow();
        }

        assertEquals(1, success.get(), "Solo una inserción debe tener éxito usando putIfAbsent en ConcurrentHashMap");
    }
}
