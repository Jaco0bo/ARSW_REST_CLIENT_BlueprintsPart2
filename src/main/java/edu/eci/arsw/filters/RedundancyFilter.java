package edu.eci.arsw.filters;


import edu.eci.arsw.model.Blueprint;
import edu.eci.arsw.model.Point;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component("redundancyFilter")
@Primary // mover esta anotación al otro filtro para cambiar el comportamiento global
public class RedundancyFilter implements BluePrintsFilter{
    @Override
    public Blueprint applyFilter(Blueprint bp) {
        List<Point> filteredPoints = new ArrayList<>();
        Point prev = null;
        for (Point p : bp.getPoints()) {
            if (prev == null || !(prev.getX() == p.getX() && prev.getY() == p.getY())) {
                filteredPoints.add(p);
            }
            prev = p;
        }
        return new Blueprint(bp.getAuthor(), bp.getName(), filteredPoints.toArray(new Point[0]));
    }
}
